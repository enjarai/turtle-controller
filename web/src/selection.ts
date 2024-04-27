import {writable} from "svelte/store";
import type {Turtle} from "@shared/types";

export const selectedTurtles = writable<string[]>([]);
export const focusedTurtle = writable<string | null>(null);

export function select(turtle: Turtle, add: boolean) {
    if (add) {
        selectedTurtles.update(t => {
            if (!t.includes(turtle.label)) {
                return [...t, turtle.label]
            }
            return t;
        });
    } else {
        selectedTurtles.set([turtle.label]);
    }
}