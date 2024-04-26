import type { Writable } from "svelte/store";

export type Turtle = {
    label: string,
    position: Vec3,
    facing: Facing,
    lock?: boolean,
    inventory: Tuple<ItemStack, 16>,
    selectedSlot: number,
};

export type WorldBlock = BlockInfo & {
    position: Vec3,
}

export type BlockInfo = {
    id: string,
    state: Record<string, string | boolean | number>,
}

export type ResponseData = {
    source: string,
    timestamp: Date,
    data: any,
    error?: boolean,
}

export type ItemStack = null | {
    id: string,
    count: number,
}

export type InventoryContext = {
    selected: Writable<number>,
    moving: Writable<boolean>,
    tryMove: (id: number, maxCount: number) => void,
    getStack: (slot: number) => ItemStack,
}

export type Facing = "north" | "east" | "south" | "west";
export type Direction = Facing | "up" | "down";
export type InteractionDirection = "up" | "forward" | "down";
export type Vec3 = [number, number, number];

export type OverlayType = "location";

export type Tuple<I, L extends number> = [I, ...I[]] & { length: L };