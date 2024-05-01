<script lang="ts">
    import type {Order} from "@shared/orders";
    import {selectedTurtles} from "../selection";
    import {addOrder} from "../orders";
    import {turtles} from "../turtles";

    async function orderAll(order: Order) {
        for (const label of $selectedTurtles) {
            const turtle = turtles.getTurtle(label);
            if (turtle) {
                await addOrder(turtle, order);
            }
        }
    }
</script>

<button on:click={() => orderAll({
    id: "dance",
    stage: 0,
})}>
    Dance
</button>
<!--<button on:click={() => orderAll({-->
<!--    id: "moveTo",-->
<!--    pos: ,-->
<!--    flyingNow: false,-->
<!--})}>-->
<!--    MoveTo-->
<!--</button>-->
<button on:click={() => orderAll({
    id: "autoMine",
    cycle: 0,
    backtrack: [],
})}>
    AutoMine
</button>
<button on:click={() => orderAll({
    id: "moveLine",
    direction: "forward",
})}>
    Move Line: Forward
</button>
<button on:click={() => orderAll({
    id: "moveLine",
    direction: "back",
})}>
    Move Line: Back
</button>
<button on:click={() => orderAll({
    id: "moveLine",
    direction: "up",
})}>
    Move Line: Up
</button>
<button on:click={() => orderAll({
    id: "moveLine",
    direction: "down",
})}>
    Move Line: Down
</button>