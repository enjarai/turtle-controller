import type {Turtle, Vec3} from "@shared/types";
import type {Order} from "@shared/orders";
import {expectResponse} from "./socket";
import {writable} from "svelte/store";

export const targetPosition = writable<Vec3>([0, 0, 0]);

export async function addOrder(turtle: Turtle, order: Order): Promise<boolean> {
    return await expectResponse("O", {
        turtle: turtle.label,
        order,
    });
}

export async function cancelOrder(turtle: Turtle, index: number): Promise<boolean> {
    return await expectResponse("S", {
        turtle: turtle.label,
        index,
    });
}