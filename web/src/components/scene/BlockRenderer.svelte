<script lang="ts">
  import { T } from "@threlte/core";
  import type { WorldBlock } from "@shared/types";
  import { Color } from "three";
  import { tooltip } from "../../misc";
  import {hashCode} from "@shared/misc";

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