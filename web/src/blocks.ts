import type { BlockInfo, Vec3, WorldBlock } from "@shared/types";
import { dataDirectory } from "./misc";
import * as fs from 'node:fs/promises';

const blocksDataPath = `${dataDirectory}/blocks.json`;

async function loadBlocks(): Promise<WorldBlock[]> {
    try {
        return JSON.parse((await fs.readFile(blocksDataPath)).toString("utf-8"));
    } catch (e) {
        return [];
    }
}

export async function saveBlocks() {
    await fs.writeFile(blocksDataPath, JSON.stringify(blocks, (key, value) => value, 2));
    console.log("Saved Blocks");
}

export function posEquals(pos1: Vec3, pos2: Vec3): boolean {
    return pos1.every((n: number, i: number) => pos2[i] === n);
}

export function getBlock(pos: Vec3) {
    return blocks.find(block => posEquals(block.position, pos))
}

export function setBlock(pos: Vec3, block: BlockInfo | null): Vec3 {
    const filtered = blocks.filter(block => !posEquals(block.position, pos));
    if (block) {
        blocks = [...filtered, {
            ...block,
            position: pos,
        }];
    } else {
        blocks = filtered;
    }
    return pos;
}

export async function syncBlocks(...posses: Vec3[]) {
    // TODO all if empty
}

export let blocks = await loadBlocks();
