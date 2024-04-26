import type { Direction, Facing, Vec3 } from "./types";

export function toRotation(facing: Facing): number {
    return toRotationId(facing) * -(Math.PI / 2);
}

function toRotationId(facing: Facing): number {
    switch (facing) {
        case "north": return 0;
        case "east": return 1;
        case "south": return 2;
        case "west": return 3;
    }
}

function fromRotationId(id: number): Facing {
    id += 4; // This accounts for one cycle into the negative, which should in theory be enough
    id %= 4;
    switch (id) {
        case 0: return "north";
        case 1: return "east";
        case 2: return "south";
        case 3: return "west";
        default: return "north";
    }
}

export function getUnitVector(direction: Direction): Vec3 {
    switch (direction) {
        case "north": return [0, 0, -1];
        case "east": return [1, 0, 0];
        case "south": return [0, 0, 1];
        case "west": return [-1, 0, 0];
        case "up": return [0, 1, 0];
        case "down": return [0, -1, 0];
    }
}

export function offsetPosition(position: Vec3, direction: Direction): Vec3 {
    const vector = getUnitVector(direction);
    return [
        position[0] + vector[0],
        position[1] + vector[1],
        position[2] + vector[2],
    ];
}

export function rotateRight(facing: Facing): Facing {
    return fromRotationId(toRotationId(facing) + 1);
}

export function rotateLeft(facing: Facing): Facing {
    return fromRotationId(toRotationId(facing) - 1);
}

export function opposite(direction: Direction): Direction {
    switch (direction) {
        case "north": return "south";
        case "east": return "west";
        case "south": return "north";
        case "west": return "east";
        case "up": return "down";
        case "down": return "up";
    }
}