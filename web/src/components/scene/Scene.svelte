<script lang="ts">
    import {T} from "@threlte/core";
    import {Gizmo, interactivity, OrbitControls} from "@threlte/extras";
    import {turtles} from "../../turtles";
    import TurtleRenderer from "./TurtleRenderer.svelte";
    import {focusedTurtle} from "../../selection.js";
    import {blocks} from "../../blocks";
    import BlockRenderer from "./BlockRenderer.svelte";

    interactivity({
        filter: (hits, state) => {
            // Only return the first hit
            return hits.slice(0, 1)
        }
    });

    let controls: OrbitControls;

    $: if ($focusedTurtle) {
        const turtle = turtles.getTurtle($focusedTurtle);
        if (turtle) {
            controls.target.set(...turtle.position);
        }
    }
</script>

<T.PerspectiveCamera
        makeDefault
        fov={60}
        position={[5, 5, 5]}
        lookAt.y={0.5}
>
    <OrbitControls bind:ref={controls} enableDamping/>
</T.PerspectiveCamera>

<Gizmo
        horizontalPlacement="left"
        paddingX={20}
        paddingY={20}
        size={100}
/>

<T.DirectionalLight position={[-20, 30, -10]}/>
<T.AmbientLight intensity={0.7}/>

<T.Mesh position.y={0}>
    <T.BoxGeometry/>
    <T.MeshBasicMaterial/>
</T.Mesh>

{#each $turtles as turtle (turtle.label)}
    <TurtleRenderer {turtle}/>
{/each}

{#each $blocks as block (block.position)}
    <BlockRenderer {block}/>
{/each}