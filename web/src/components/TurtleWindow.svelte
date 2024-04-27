<script lang="ts">
    import type {Turtle} from "@shared/types";
    import TurtleInventory from "./TurtleInventory.svelte";
    import TurtleOrders from "./TurtleOrders.svelte";

    export let turtle: Turtle;

    let tab = "inventory";
</script>


<div class="inventory">
    {turtle.label}
    <button on:click={() => tab = "inventory"} class:active={tab === "inventory"}>Inventory</button>
    <button on:click={() => tab = "orders"} class:active={tab === "orders"}>Orders</button>
    <hr>

    {#if tab === "inventory"}
        <TurtleInventory {turtle}/>
    {:else if tab === "orders"}
        <TurtleOrders {turtle}/>
    {/if}
</div>