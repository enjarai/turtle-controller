import type { BlockInfo, Vec3, WorldBlock } from "@shared/types";
import {writable} from "svelte/store";
import {posEquals} from "@shared/misc";

export const blocks = {
    ...writable<WorldBlock[]>([]),

    setBlock(pos: Vec3, block: BlockInfo | null) {
        this.update(b => {
            const filtered = b.filter(block => !posEquals(block.position, pos));
            if (block) {
                return [...filtered, {
                    ...block,
                    position: pos,
                }];
            }
            return filtered;
        });
    },

    getBlock(pos: Vec3): BlockInfo | null {
        let block = null
        this.subscribe(b => {
            block = b.find(block => posEquals(block.position, pos));
        })();
        return block;
    }
};
