<script lang="ts">
import OverlayWindow from "./OverlayWindow.svelte";
import { selectedTurtles } from "../selection";
import { turtles } from "../turtles";

$: turtles.updateTurtle($selectedTurtles[0], t => t);
$: turtle = turtles.getTurtle($selectedTurtles[0]);
</script>

<OverlayWindow>
  {#if turtle}
    <label for="x">X</label>
    <input type="number" id="x" bind:value={turtle.position[0]}>
    <label for="y">Y</label>
    <input type="number" id="y" bind:value={turtle.position[1]}>
    <label for="z">Z</label>
    <input type="number" id="z" bind:value={turtle.position[2]}>
    <label for="facing">Facing</label>
    <select id="facing" bind:value={turtle.facing}>
      <option value="north">North</option>
      <option value="east">East</option>
      <option value="south">South</option>
      <option value="west">West</option>
    </select>
  {:else}
    No Turtle selected
  {/if}
</OverlayWindow>