import type {BlockInfo, InteractionDirection, ItemStack, Tuple, Turtle, WorldBlock} from "@shared/types";
import {offsetPosition, opposite, rotateLeft, rotateRight} from "@shared/direction";
import {dataDirectory} from "./misc";
import * as fs from 'node:fs/promises';
import {getConnection} from "./connections";
import {setBlock, syncBlocks} from "./blocks";
import {sendToAll} from "./clients";

const turtlesDataPath = `${dataDirectory}/turtles.json`;

async function loadTurtles(): Promise<Turtle[]> {
    try {
        return JSON.parse((await fs.readFile(turtlesDataPath)).toString("utf-8"));
    } catch (e) {
        return [];
    }
}

export async function saveTurtles() {
    await fs.writeFile(turtlesDataPath, JSON.stringify(turtles, (key, value) => {
        switch (key) {
            case "connection":
            case "lock":
                return undefined;
            default:
                return value;
        }
    }, 2));
    console.log("Saved Turtles");
}

export async function syncTurtles(...syncTurtles: Turtle[]) {
    if (syncTurtles.length > 0) {
        sendToAll("t:" + JSON.stringify(syncTurtles));
    } else {
        sendToAll("T:" + JSON.stringify(turtles));
    }
}

export function getTurtle(label: string | null): Turtle | undefined {
    if (label) {
        return turtles.find(turtle => turtle.label === label);
    }
    return undefined;
}

export function addTurtle(turtle: Turtle) {
    turtles.push(turtle);
}

export let turtles = await loadTurtles();

export async function sendCommand<T>(turtle: Turtle, command: string): Promise<T> {
    return new Promise((resolve, reject) => {
        let connection = getConnection(turtle);
        if (!connection) {
            reject("Turtle not connected");
            return;
        } else if (turtle.lock) {
            reject("Turtle is busy");
            return;
        }

        turtle.lock = true;

        connection.send("e:" + command);
        connection.once("message", data => {
            const response = data.toString("utf-8");
            const type = response.slice(0, 1);
            const value = response.slice(2, response.length);
            if (type === "s") {
                resolve(JSON.parse(value));
            } else {
                reject(value);
            }
            turtle.lock = false;
        });
    });
}

function createMoveCommand(command: string, updater: (turtle: Turtle) => void): (turtle: Turtle) => Promise<boolean> {
    return async turtle => {
        const success = await sendCommand<boolean>(turtle, command);
        if (success) {
            updater(turtle);
            scanAll(turtle).then();
            await syncTurtles(turtle);
        }
        return success;
    };
}

// export const actions = {
//     forward, back, up, down, turnLeft, turnRight,
//     scanAll, refreshInventory, selectSlot, transferTo,
//     suck, drop, dig, place,
// };

export const forward = createMoveCommand("return turtle.forward()", t => t.position = offsetPosition(t.position, t.facing));
export const back = createMoveCommand("return turtle.back()", t => t.position = offsetPosition(t.position, opposite(t.facing)));
export const up = createMoveCommand("return turtle.up()", t => t.position = offsetPosition(t.position, "up"));
export const down = createMoveCommand("return turtle.down()", t => t.position = offsetPosition(t.position, "down"));
export const turnLeft = createMoveCommand("return turtle.turnLeft()", t => t.facing = rotateLeft(t.facing));
export const turnRight = createMoveCommand("return turtle.turnRight()", t => t.facing = rotateRight(t.facing));

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

    await syncBlocks(
        setBlock(offsetPosition(turtle.position, "down"), scanResult[0] || null),
        setBlock(offsetPosition(turtle.position, turtle.facing), scanResult[1] || null),
        setBlock(offsetPosition(turtle.position, "up"), scanResult[2] || null),
        setBlock(turtle.position, null)
    );
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
        const [result, selectedSlot] = await requestInventory(turtle);

        turtle.inventory = result
        turtle.selectedSlot = selectedSlot - 1;
        await syncTurtles(turtle);
    } catch (e) {
        console.warn("Failed to refresh inventory: " + e);
    }
}

export async function selectSlot(turtle: Turtle, slot: number): Promise<boolean> {
    try {
        const result = await sendCommand<boolean>(turtle, `return turtle.select(${slot + 1})`);

        if (result) {
            turtle.selectedSlot = slot;
            await syncTurtles(turtle);
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
