import type {AutoMineOrder, MitosisOrder, Order} from "@shared/orders";
import type {Turtle} from "@shared/types";

export async function tick() {

}

const orders: Record<string, (order: Order, turtle: Turtle) => Promise<void>> = {
    moveTo, mitosis
}

async function moveTo(order: AutoMineOrder, turtle: Turtle) {

}

async function mitosis(order: MitosisOrder, turtle: Turtle) {

}