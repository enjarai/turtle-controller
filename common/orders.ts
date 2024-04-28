import type {Vec3} from "@shared/types";

export type Order = MoveToOrder | MineBlockOrder | MineAreaOrder | AutoMineOrder | MitosisOrder | DanceOrder;

export type MoveToOrder = {
    id: "moveTo",
    pos: Vec3,
    flyingNow: boolean,
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

export type DanceOrder = {
    id: "dance",
    stage: number,
}