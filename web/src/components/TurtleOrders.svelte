<script lang="ts">
    import type {Turtle} from "@shared/types";
    import {cancelOrder} from "../orders";

    export let turtle: Turtle;
</script>

<table>
    {#each turtle.orders as order, i}
        <tr>
            <td>{order.id}</td>
            <td><button on:click={() => cancelOrder(turtle, i)}>X</button></td>
        </tr>
    {:else}
        <tr>
            <td>None...</td>
        </tr>
    {/each}
</table>

<style>
    table {
        width: 100%;
        background-color: #1c1c1c;
    }

    tr:nth-child(odd) {
        background-color: #262626;
    }
</style>