import type {Vec3} from "./types";

export function hashCode(str: string) {
    let hash = 0,
        i, chr;
    if (str.length === 0) return hash;
    for (i = 0; i < str.length; i++) {
        chr = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}

export function posEquals(pos1: Vec3, pos2: Vec3): boolean {
    return pos1.every((n: number, i: number) => pos2[i] === n);
}