<script lang="ts">
    import type {InventoryContext, ItemStack} from "@shared/types";
    import {tooltip} from "../misc";
    import {Color} from "three";
    import {getContext} from "svelte";
    import {hashCode} from "@shared/misc";

    export let id: number;
    export let stack: ItemStack;
    export let selected: boolean;

    const {trySelect, moving, tryMove, getStack} = getContext<InventoryContext>('gamer-inv');

    function onClick() {
        if (selected) {
            if (stack) {
                $moving = !$moving;
            }
        } else {
            if ($moving) {
                tryMove(id, 64);
            }
            trySelect(id);
            $moving = false;
        }
    }

    // const menu = new nw.Menu();
    //
    // const menuItems = [
    //     {
    //         label: "Move 1", async click() {
    //             tryMove(id, 1);
    //             $selected = id;
    //             $moving = false;
    //         }
    //     },
    //     {
    //         label: "Move Half", click() {
    //             const sourceStack = getStack($selected);
    //             if (sourceStack) {
    //                 tryMove(id, Math.min(sourceStack.count / 2));
    //                 $selected = id;
    //                 $moving = false;
    //             }
    //         }
    //     }
    // ];
    //
    // menuItems.forEach(function(item) {
    //     menu.append(new nw.MenuItem(item));
    // });

    // on:contextmenu|preventDefault|stopPropagation={({ x, y }) => $selected !== id && menu.popup(x, y)}

    $: hue = Math.abs(hashCode(stack?.id || "") % 1000);
    $: color = stack && new Color().setHSL(hue / 1000, 0.8, 0.5).getHexString();
    $: highlighted = selected;
</script>

<td class="slot"
    style:background-color={highlighted ? $moving ? "#5b9b59" : "#9b8659" : "#202020"}
    on:mousemove={() => stack && ($tooltip = stack.id)}
    on:mouseleave={() => $tooltip = null}
    on:click={onClick}>
    {#if stack}
        <div class="item"
             style:background-color={`#${color}`}>
            {stack.count}
        </div>
    {/if}
</td>

<style>
    .slot {
        width: 48px;
        height: 48px;
        color: black;
        text-align: center;
        font-size: 24px;
    }

    .item {
        width: 40px;
        height: 40px;
        margin: 4px;
    }
</style>