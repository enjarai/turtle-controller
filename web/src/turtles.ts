import type { InteractionDirection, Turtle } from "@shared/types";
import { writable } from "svelte/store";
import { focusedTurtle, selectedTurtles } from "./selection";
import {expectResponse} from "./socket";

export let turtles = {
    ...writable<Turtle[]>([]),

    updateTurtle(label: string, updater: (turtle: Turtle | null) => Turtle) {
        this.update(turtles => {
            const i = turtles.findIndex(t => t.label === label);
            if (i !== -1) {
                turtles.splice(i, 1, updater(turtles[i]));
            } else {
                turtles.push(updater(null));
            }
            return turtles;
        });
    },

    getTurtle(label: string): Turtle | null {
        let turtle = null
        this.subscribe(t => {
            turtle = t.find(ti => ti.label === label);
        })();
        return turtle;
    }
};

turtles.subscribe(t => {
    selectedTurtles.update(t2 => t2);
    focusedTurtle.update(t2 => t2);

    console.log(t);
});

export async function sendCommand<T>(turtle: Turtle, command: string): Promise<T | null> {
    return await expectResponse("e", {
        turtle: turtle.label,
        command,
    });
}

function createMoveCommand(command: string): (turtle: Turtle) => Promise<boolean> {
    return async turtle => {
        return await expectResponse("m", {
            turtle: turtle.label,
            command,
        }) || false;
    };
}

export const forward = createMoveCommand("forward");
export const back = createMoveCommand("back");
export const up = createMoveCommand("up");
export const down = createMoveCommand("down");
export const turnLeft = createMoveCommand("turnLeft");
export const turnRight = createMoveCommand("turnRight");

export async function keyPress(e: KeyboardEvent) {
    selectedTurtles.subscribe(t => {
        for (const label of t) {
            const turtle = turtles.getTurtle(label);
            if (turtle) {
                try {
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
                } catch (e) {
                    console.warn(`Failed to input movement: ${e}`);
                }
            }
        }
    })();
}

export async function scanAll(turtle: Turtle): Promise<boolean> {
    return await expectResponse("s", turtle.label);
}

export async function refreshInventory(turtle: Turtle): Promise<boolean> {
    return await expectResponse("i", turtle.label);
}

export async function selectSlot(turtle: Turtle, slot: number): Promise<boolean> {
    return await expectResponse("o", {
        turtle: turtle.label,
        slot,
    });
}

export async function transferTo(turtle: Turtle, destinationSlot: number, maxCount?: number): Promise<boolean> {
    return await expectResponse("f", {
        turtle: turtle.label,
        destinationSlot,
        maxCount: maxCount || null,
    });
}

function createUpForwardDownFunction(command: string): (turtle: Turtle, direction: InteractionDirection) => Promise<boolean> {
    return async (turtle: Turtle, direction: InteractionDirection) => {
        return await expectResponse("n", {
            turtle: turtle.label,
            command,
            direction,
        });
    };
}

export const suck = createUpForwardDownFunction("suck");
export const drop = createUpForwardDownFunction("drop");
export const dig = createUpForwardDownFunction("dig");
export const place = createUpForwardDownFunction("place");

export async function refuel(turtle: Turtle): Promise<boolean> {
    return await expectResponse("u", turtle.label);
}
