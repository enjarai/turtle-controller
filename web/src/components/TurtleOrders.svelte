<script lang="ts">
    import type {Turtle} from "@shared/types";

    export let turtle: Turtle;
</script>

<table>
    {#each turtle.orders as order}
        <tr>
            <td>{order.id}</td>
        </tr>
    {:else}
        <tr>
            <td>None...</td>
        </tr>
    {/each}
</table>