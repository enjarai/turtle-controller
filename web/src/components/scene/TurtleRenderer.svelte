<script lang="ts">
  import { T } from "@threlte/core";
  import { toRotation } from "@shared/direction";
  import type { Turtle } from "@shared/types";
  import { select, selectedTurtles } from "../../selection";
  import NormalTurtle from "./models/NormalTurtle.svelte";
  import { tooltip } from "../../misc";

  export let turtle: Turtle;

  function onClick(e: any) {
      select(turtle, e.ctrlKey);
  }

  $: selected = $selectedTurtles.includes(turtle.label);
  $: modelPos = [turtle.position[0], turtle.position[1] - 0.5, turtle.position[2]]
</script>

<NormalTurtle
  rotation.y={toRotation(turtle.facing)}
  position={modelPos}
  on:click={onClick}
  on:pointermove={() => $tooltip = turtle.label}
  on:pointerleave={() => $tooltip = null}
/>
{#if selected}
  <T.Mesh position={turtle.position}>
    <T.BoxGeometry/>
    <T.MeshBasicMaterial color={0x00ff00} opacity={0.2} transparent={true}/>
  </T.Mesh>
{/if}