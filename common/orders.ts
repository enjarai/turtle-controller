import type {Vec3} from "@shared/types";

export type Order = MoveToOrder | MineBlockOrder | MineAreaOrder | AutoMineOrder | MitosisOrder;

export type MoveToOrder = {
    id: "moveTo",
    pos: Vec3,
}

export type MineBlockOrder = {
    id: "mineBlock",
    pos: Vec3,
}

export type MineAreaOrder = {
    id: "mineArea",
    start: Vec3,
    end: Vec3,
}

export type AutoMineOrder = {
    id: "autoMine",
}

export type MitosisOrder = {
    id: "mitosis",
    stage: number,
}