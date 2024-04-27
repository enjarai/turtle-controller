<script lang="ts">
import OverlayWindow from "./OverlayWindow.svelte";
import { selectedTurtles } from "../selection";
import { turtles } from "../turtles";

$: turtles.updateTurtle($selectedTurtles[0].label, t => {})
</script>

<OverlayWindow>
  {#if $selectedTurtles}
    <label for="x">X</label>
    <input type="number" id="x" bind:value={$selectedTurtles[0].position[0]}>
    <label for="y">Y</label>
    <input type="number" id="y" bind:value={$selectedTurtles[0].position[1]}>
    <label for="z">Z</label>
    <input type="number" id="z" bind:value={$selectedTurtles[0].position[2]}>
    <label for="facing">Facing</label>
    <select id="facing" bind:value={$selectedTurtles[0].facing}>
      <option value="north">North</option>
      <option value="east">East</option>
      <option value="south">South</option>
      <option value="west">West</option>
    </select>
  {:else}
    No Turtle selected
  {/if}
</OverlayWindow>