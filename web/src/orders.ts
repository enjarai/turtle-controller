import type {Turtle} from "@shared/types";
import type {Order} from "@shared/orders";
import {expectResponse} from "./socket";

export async function addOrder(turtle: Turtle, order: Order): Promise<boolean> {
    return await expectResponse("O", {
        turtle: turtle.label,
        order,
    });
}