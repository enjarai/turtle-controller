<script lang="ts">
  import { T } from "@threlte/core";
  import type { WorldBlock } from "../../types";
  import { Color } from "three";
  import { hashCode, tooltip } from "../../misc";
  import NormalTurtle from "./models/NormalTurtle.svelte";

  export let block: WorldBlock;

  $: hue = Math.abs(hashCode(block?.id || "") % 1000);
  $: color = new Color().setHSL(hue / 1000, 0.8, 0.5);
</script>

<T.Mesh position={block.position}
        on:pointermove={() => $tooltip = block.id}
        on:pointerleave={() => $tooltip = null}>
  <T.BoxGeometry/>
  <T.MeshLambertMaterial color={color}/>
</T.Mesh>