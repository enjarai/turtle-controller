<script lang="ts">
    import type { Turtle } from "../types";
    import { select, selectedTurtles, focusedTurtle } from "../selection";
    import { openOverlay } from "../misc";
    import { refreshInventory, scanAll } from "../turtles";

    export let turtle: Turtle;

    function onClick(e: any) {
        select(turtle, e.ctrlKey);
        $focusedTurtle = turtle;
    }

    const menu = new nw.Menu();

    const menuItems = [
        {
            label: "Refresh Data", async click() {
                try {
                    await scanAll(turtle);
                    await refreshInventory(turtle);
                } catch (ignored) {}
            }
        },
        {
            label: "Modify Position", click() {
                select(turtle, true);
                $openOverlay = "location";
            }
        }
    ];

    menuItems.forEach(function(item) {
        menu.append(new nw.MenuItem(item));
    });
</script>

<li class="turtle-entry"
    class:selected={$selectedTurtles.includes(turtle)}
    class:connected={turtle.connection}
    on:click|stopPropagation={onClick}
    on:contextmenu|preventDefault|stopPropagation={({x, y}) => menu.popup(x, y)}>
  {turtle.label}
</li>

<style>
    .selected {
        background: green;
    }

    .connected {
        font-weight: bolder;
    }

    .turtle-entry {
        list-style: none;
        padding: 5px;
    }
</style>