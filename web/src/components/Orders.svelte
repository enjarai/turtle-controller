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
