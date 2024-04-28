import type {AutoMineOrder, DanceOrder, MitosisOrder, MoveToOrder, Order} from "@shared/orders";
import type {Direction, Turtle} from "@shared/types";
import {back, dig, down, forward, moveActions, turnLeft, turnRight, turtles, up} from "./turtles";
import {getDirectionOfVector, isHorizontal, offsetPosition, oppositeAction, rotateLeft} from "@shared/direction";
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

const oreIds = [
    "minecraft:coal_ore", "minecraft:iron_ore", "minecraft:gold_ore", "minecraft:diamond_ore",
    "minecraft:lapis_ore", "minecraft:emerald_ore", "minecraft:copper_ore", "minecraft:redstone_ore",
    "minecraft:deepslate_coal_ore", "minecraft:deepslate_iron_ore", "minecraft:deepslate_gold_ore", "minecraft:deepslate_diamond_ore",
    "minecraft:deepslate_lapis_ore", "minecraft:deepslate_emerald_ore", "minecraft:deepslate_copper_ore", "minecraft:deepslate_redstone_ore",
    "minecraft:nether_gold_ore", "minecraft:nether_quartz_ore", "minecraft:ancient_debris",
]

async function autoMine(order: AutoMineOrder, turtle: Turtle) {
    if (turtle.fuelLevel < 100) {
        turtle.orders.splice(0, 1);
        return;
    }

    if (order.next) {
        await moveActions[order.next](turtle);
        order.backtrack.splice(0, 0, order.next);
        delete order.next;
        return;
    }

    const checkOre = (direction: Direction) => oreIds.includes(getBlock(offsetPosition(turtle.position, direction))?.id);

    if (checkOre("up")) {
        await dig(turtle, "up");
        order.next = "up";
    } else if (checkOre(turtle.facing)) {
        await dig(turtle, "forward");
        order.next = "forward";
    } else if (checkOre("down")) {
        await dig(turtle, "down");
        order.next = "down";

    } else {
        if (order.backtrack.length <= 0) {
            const actions = [
                () => dig(turtle, "forward"),
                forward,
                turnLeft,
                turnRight,
                turnRight,
                turnLeft,
            ];
            await actions[order.cycle](turtle);
            order.cycle++;
            if (order.cycle === actions.length) {
                order.cycle = 0;
            }
        } else {
            await moveActions[oppositeAction(order.backtrack[0])](turtle);
            order.backtrack.splice(0, 1);
        }
    }
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