<script lang="ts">
    import type {InventoryContext, ItemStack} from "@shared/types";
    import Slot from "./Slot.svelte";
    import {createEventDispatcher, setContext} from "svelte";
    import {writable} from "svelte/store";

    const dispatcher = createEventDispatcher();

    export let stacks: ItemStack[];
    export let width: number;
    export let height: number;
    export let selectedSlot: number;

    const moving = writable<boolean>(false);

    setContext<InventoryContext>('gamer-inv', {
        moving,
        trySelect(id: number) {
            dispatcher('selectstack', {slot: id})
        },
        tryMove(id: number, maxCount: number) {
            dispatcher('movestack', {source: selectedSlot, destination: id, maxCount});
        },
        getStack(slot: number): ItemStack {
            return stacks[slot];
        }
    });
</script>

<table class="inventory-table">
    {#each {length: height} as _, y}
        <tr>
            {#each {length: width} as _, x}
                <Slot id={height * y + x} stack={stacks[height * y + x] || null} selected={selectedSlot === height * y + x}/>
            {/each}
        </tr>
    {/each}
</table>

<style>
    .inventory-table {
        flex-grow: 0;
    }
</style>