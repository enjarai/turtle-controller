import type {DanceOrder, MitosisOrder, MoveToOrder, Order} from "@shared/orders";
import type {Turtle} from "@shared/types";
import {back, down, forward, turnLeft, turnRight, turtles, up} from "./turtles";

export async function tick() {
    for (const turtle of turtles) {
        if (!turtle.lock && turtle.orders.length > 0) {
            // Execute async
            try {
                tickOrder(turtle.orders[0], turtle).then();
            } catch (e) {
                console.warn(`Error executing order: {e}`);
            }
        }
    }
}

async function tickOrder(order: Order, turtle: Turtle) {
    if (order.id === "moveTo") {
        await moveTo(order, turtle);
    } else if (order.id === "mitosis") {
        await mitosis(order, turtle);
    } else if (order.id === "dance") {
        await dance(order, turtle);
    }
}

async function moveTo(order: MoveToOrder, turtle: Turtle) {

}

async function mitosis(order: MitosisOrder, turtle: Turtle) {

}

async function dance(order: DanceOrder, turtle: Turtle) {
    const actions = [
        turnLeft,
        forward,
        back,
        turnRight,
        up,
        turnRight,
        turnRight,
        turnRight,
        turnRight,
        down,
    ];
    await actions[order.stage](turtle);
    order.stage++;
    if (order.stage === actions.length) {
        order.stage = 0;
    }
}