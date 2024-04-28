import type {AutoMineOrder, DanceOrder, MitosisOrder, MoveToOrder, Order} from "@shared/orders";
import type {Turtle} from "@shared/types";
import {back, down, forward, moveActions, turnLeft, turnRight, turtles, up} from "./turtles";
import {getDirectionOfVector, isHorizontal, offsetPosition, rotateLeft} from "@shared/direction";
import {getBlock} from "./blocks";

export async function tick() {
    for (const turtle of turtles) {
        if (!turtle.lock && turtle.orders.length > 0) {
            // Execute async
            try {
                tickOrder(turtle.orders[0], turtle).then();
            } catch (e) {
                console.warn(`Error executing order: ${e}`);
            }
        }
    }
}

async function tickOrder(order: Order, turtle: Turtle) {
    if (order.id === "moveTo") {
        await moveTo(order, turtle);
    } else if (order.id === "autoMine") {
        await autoMine(order, turtle);
    } else if (order.id === "mitosis") {
        await mitosis(order, turtle);
    } else if (order.id === "dance") {
        await dance(order, turtle);
    }
}

async function moveTo(order: MoveToOrder, turtle: Turtle) {
    const blockBelow = getBlock(offsetPosition(turtle.position, "down"));
    if (!order.flyingNow && !blockBelow) {
        order.flyingNow = true;
        await down(turtle);
        return;
    }
    if (order.flyingNow && blockBelow) {
        order.flyingNow = false;
    }

    const xDiff = order.pos[0] - turtle.position[0];
    const yDiff = order.pos[1] - turtle.position[1];
    const zDiff = order.pos[2] - turtle.position[2];

    const direction = getDirectionOfVector([xDiff, yDiff, zDiff]);

    if (isHorizontal(direction)) {
        if (turtle.facing === direction) {
            await forward(turtle);
        } else {
            if (rotateLeft(direction) === turtle.facing) {
                await turnLeft(turtle);
            } else {
                await turnRight(turtle);
            }
        }
    } else {
        // TODO
        if (direction === "up") {
            order.flyingNow = true;
        }
        await moveActions[direction](turtle);
    }
}

async function autoMine(order: AutoMineOrder, turtle: Turtle) {

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