import type { BlockInfo, Vec3, WorldBlock } from "@shared/types";
import { dataDirectory } from "./misc";
import * as fs from 'node:fs/promises';
import {posEquals} from "@shared/misc";
import {sendToAll} from "./clients";

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
    if (posses.length > 0) {
        sendToAll("b:" + JSON.stringify(posses.map((s) => getBlock(s))));
    } else {
        sendToAll("B:" + JSON.stringify(blocks));
    }
}

export let blocks = await loadBlocks();
