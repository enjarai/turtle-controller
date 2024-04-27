import type { BlockInfo, InteractionDirection, ItemStack, Tuple, Turtle, WorldBlock } from "@shared/types";
import { writable } from "svelte/store";
import { offsetPosition, opposite, rotateLeft, rotateRight } from "@shared/direction";
import { focusedTurtle, selectedTurtles } from "./selection";
import { blocks } from "./blocks";
import {expectResponse, wsc} from "./socket";

export let turtles = {
    ...writable<Turtle[]>([]),

    updateTurtle(label: string, updater: (turtle: Turtle) => void) {
        this.update(turtles => {
            const i = turtles.findIndex(t => t.label === label);
            if (i !== -1) {
                updater(turtles[i]);
            }
            return turtles;
        });
    },

    updateOrCreateTurtle(label: string, updater: (turtle: Turtle | null) => Turtle) {
        this.update(turtles => {
            const i = turtles.findIndex(t => t.label === label);
            if (i === -1) {
                turtles = [...turtles, updater(null)];
            } else {
                turtles[i] = updater(turtles[i]);
            }
            return turtles;
        });
    }
};

turtles.subscribe(t => {
    selectedTurtles.update(t2 => t2);
    focusedTurtle.update(t2 => t2);
});

export async function sendCommand<T>(turtle: Turtle, command: string): Promise<T | null> {
    return await expectResponse("e", JSON.stringify({
        turtle: turtle.label,
        command,
    }));
}

function createMoveCommand(command: string, updater: (turtle: Turtle) => void): (turtle: Turtle) => Promise<boolean> {
    return async turtle => {
        const success = await sendCommand<boolean>(turtle, command);
        if (success) {
            turtles.updateTurtle(turtle.label, updater);
            scanAll(turtle).then();
        }
        return success;
    };
}

export const forward = createMoveCommand("return turtle.forward()", t => t.position = offsetPosition(t.position, t.facing));
export const back = createMoveCommand("return turtle.back()", t => t.position = offsetPosition(t.position, opposite(t.facing)));
export const up = createMoveCommand("return turtle.up()", t => t.position = offsetPosition(t.position, "up"));
export const down = createMoveCommand("return turtle.down()", t => t.position = offsetPosition(t.position, "down"));
export const turnLeft = createMoveCommand("return turtle.turnLeft()", t => t.facing = rotateLeft(t.facing));
export const turnRight = createMoveCommand("return turtle.turnRight()", t => t.facing = rotateRight(t.facing));

export async function keyPress(e: KeyboardEvent) {
    selectedTurtles.subscribe(t => {
        for (const turtle of t) {
            if (!turtle.connection) {
                console.log("Skipping turtle control, not connected.")
                continue;
            } else if (turtle.lock) {
                console.log("Skipping turtle control, already in use.")
                continue;
            }

            switch (e.key) {
                case "w":
                    forward(turtle);
                    break;
                case "s":
                    back(turtle);
                    break;
                case "a":
                    turnLeft(turtle);
                    break;
                case "d":
                    turnRight(turtle);
                    break;
                case "r":
                    up(turtle);
                    break;
                case "f":
                    down(turtle);
                    break;
            }
        }
    })();
}

export async function scanAll(turtle: Turtle) {
    let scanResult = await sendCommand<(BlockInfo | false)[]>(turtle, `
    function look(fun)
        s, r = fun()
        if not s then return s end
        return {
            id = r.name,
            state = r.state
        }
    end
    
    return {
        look(turtle.inspectDown),
        look(turtle.inspect),
        look(turtle.inspectUp)
    }
    `);

    scanResult = scanResult.map(info => info && !info.id.includes("turtle") ? info : false);

    blocks.setBlock(offsetPosition(turtle.position, "down"), scanResult[0] || null)
    blocks.setBlock(offsetPosition(turtle.position, turtle.facing), scanResult[1] || null)
    blocks.setBlock(offsetPosition(turtle.position, "up"), scanResult[2] || null)
    blocks.setBlock(turtle.position, null);
}

export async function requestInventory(turtle: Turtle): Promise<[Tuple<ItemStack, 16>, number]> {
    return await sendCommand<[Tuple<ItemStack, 16>, number]>(turtle, `
    r = {}
    for i=1,16 do
        d = turtle.getItemDetail(i)
        if not d then
            r[i] = textutils.json_null
        else
            r[i] = {
                id = d.name,
                count = d.count
            }
        end
    end
    return {r, turtle.getSelectedSlot()}
    `);
}

export async function refreshInventory(turtle: Turtle) {
    try {
        const [ result, selectedSlot ] = await requestInventory(turtle);

        turtles.updateTurtle(turtle.label, t => {
            t.inventory = result
            t.selectedSlot = selectedSlot - 1;
        });
    } catch (e) {
        console.warn("Failed to refresh inventory: " + e);
    }
}

export async function selectSlot(turtle: Turtle, slot: number): Promise<boolean> {
    try {
        const result = await sendCommand<boolean>(turtle, `return turtle.select(${slot + 1})`);

        if (result) {
            turtles.updateTurtle(turtle.label, t => t.selectedSlot = slot);
        }

        return result;
    } catch (e) {
        console.warn("Failed to select slot: " + e);
        return false;
    }
}

export async function transferTo(turtle: Turtle, destinationSlot: number, maxCount?: number): Promise<boolean> {
    try {
        let result: boolean;

        if (maxCount) {
            result = await sendCommand<boolean>(turtle, `return turtle.transferTo(${destinationSlot + 1}, ${maxCount})`);
        } else {
            result = await sendCommand<boolean>(turtle, `return turtle.transferTo(${destinationSlot + 1})`);
        }

        if (result) {
            await selectSlot(turtle, destinationSlot);
            await refreshInventory(turtle);
        }
        return result;
    } catch (e) {
        console.warn("Failed to transfer item: " + e);
        return false;
    }
}

function createUpForwardDownFunction(commandBuilder: (keyWord: "Up" | "" | "Down") => string): (turtle: Turtle, direction: InteractionDirection) => Promise<boolean> {
    return async (turtle: Turtle, direction: InteractionDirection) => {
        try {
            const keyWord = direction == "up" ? "Up" : direction == "forward" ? "" : "Down";
            const result = await sendCommand<boolean>(turtle, commandBuilder(keyWord));

            if (result) {
                await refreshInventory(turtle);
            }

            return result;
        } catch (e) {
            console.warn("Failed to run interaction: " + e);
            return false;
        }
    }
}

export const suck = createUpForwardDownFunction(keyWord => `return turtle.suck${keyWord}()`);
export const drop = createUpForwardDownFunction(keyWord => `return turtle.drop${keyWord}()`);
export const dig = createUpForwardDownFunction(keyWord => `return turtle.dig${keyWord}()`);
export const place = createUpForwardDownFunction(keyWord => `return turtle.place${keyWord}()`);
