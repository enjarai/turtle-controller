<script lang="ts">
    import type {InteractionDirection, Turtle} from "@shared/types";
    import Inventory from "./Inventory.svelte";
    import {dig, drop, place, refuel, selectSlot, suck, transferTo} from "../turtles";
    import ButtonGroup from "./ButtonGroup.svelte";

    export let turtle: Turtle;

    function selectStack(e: any) {
        selectSlot(turtle, e.detail.slot);
    }

    function moveStack(e: any) {
        transferTo(turtle, e.detail.destination, e.detail.maxCount);
    }

    function iSuck(direction: InteractionDirection) {
        suck(turtle, direction);
    }

    function eyeDrop(direction: InteractionDirection) {
        drop(turtle, direction);
    }

    function iBreak(direction: InteractionDirection) {
        dig(turtle, direction);
    }

    function iPlace(direction: InteractionDirection) {
        place(turtle, direction);
    }

    function iRefuel() {
        refuel(turtle);
    }
</script>

<div class="inventory">
    {turtle.label} Inventory
    <hr>
    <div class="body">
        <div class="inventory">
            <Inventory stacks={turtle.inventory}
                       width={4} height={4}
                       selectedSlot={turtle.selectedSlot}
                       on:selectstack={selectStack}
                       on:movestack={moveStack}/>
            <table>
                <tr>
                    <td>Fuel</td>
                    <td>{turtle.fuelLevel}</td>
                </tr>
            </table>
        </div>
        <div>
            <ButtonGroup>
                <button on:click={() => iSuck("up")}>&uarr;</button>
                <button on:click={() => iSuck("forward")}>Suck</button>
                <button on:click={() => iSuck("down")}>&darr;</button>
            </ButtonGroup>
            <ButtonGroup>
                <button on:click={() => eyeDrop("up")}>&uarr;</button>
                <button on:click={() => eyeDrop("forward")}>Drop</button>
                <button on:click={() => eyeDrop("down")}>&darr;</button>
            </ButtonGroup>
            <ButtonGroup>
                <button on:click={() => iBreak("up")}>&uarr;</button>
                <button on:click={() => iBreak("forward")}>Break</button>
                <button on:click={() => iBreak("down")}>&darr;</button>
            </ButtonGroup>
            <ButtonGroup>
                <button on:click={() => iPlace("up")}>&uarr;</button>
                <button on:click={() => iPlace("forward")}>Place</button>
                <button on:click={() => iPlace("down")}>&darr;</button>
            </ButtonGroup>
            <button on:click={() => iRefuel()}>Refuel</button>
        </div>
    </div>
</div>

<style>
    .body {
        display: flex;
    }
</style>