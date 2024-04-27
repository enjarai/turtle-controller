<script lang="ts">
  import type { InventoryContext, ItemStack } from "@shared/types";
  import Slot from "./Slot.svelte";
  import { createEventDispatcher, setContext } from "svelte";
  import { writable } from "svelte/store";

  const dispatcher = createEventDispatcher();

  export let stacks: ItemStack[];
  export let width: number;
  export let height: number;
  export let selectedSlot: number;

  const selected = writable<number>(selectedSlot);
  const moving = writable<boolean>(false);

  selected.subscribe(s => s && dispatcher('selectstack', { slot: s }))

  setContext<InventoryContext>('gamer-inv', {
      selected,
      moving,
      tryMove(id: number, maxCount: number) {
          if ($selected) {
              dispatcher('movestack', { source: $selected, destination: id, maxCount });
              // const selectedStack = stacks[$selected];
              // stacks[$selected] = stacks[id];
              // stacks[id] = selectedStack;
          }
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
        <Slot id={height * y + x} stack={stacks[height * y + x] || null}/>
      {/each}
    </tr>
  {/each}
</table>

<style>
  .inventory-table {
      flex-grow: 0;
  }
</style>