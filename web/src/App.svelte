<script lang="ts">
  import { back, forward, keyPress, turnLeft, turnRight, turtles } from "./turtles";
  import TurtleEntry from "./components/TurtleEntry.svelte";
  import { Canvas } from "@threlte/core";
  import Scene from "./components/scene/Scene.svelte";
  import { selectedTurtles } from "./selection";
  import { openOverlay, tooltip } from "./misc";
  import LocationOverlay from "./components/LocationOverlay.svelte";
  import Terminal from "./components/Terminal.svelte";
  import TurtleInventory from "./components/TurtleInventory.svelte";
  import type {Turtle} from '@shared/types';
  import TurtleWindow from "./components/TurtleWindow.svelte";
  import Orders from "./components/Orders.svelte";

  let mouse = {x: 0, y: 0};

  function moveMouse(e: MouseEvent) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  }

  $: selected = $selectedTurtles.map(t => turtles.getTurtle(t)).filter(t => t !== null).map(t => t as Turtle);
</script>

<!--<svelte:document on:contextmenu|preventDefault|stopPropagation={({ x, y }) => menu.popup(x, y)} />-->
<svelte:document on:keypress={keyPress} on:mousemove={moveMouse} />

<div class="main">
  <div class="sidebar-left">
    <div class="turtle-list" on:click={() => $selectedTurtles = []}>
      {#each $turtles as turtle (turtle.label)}
        <TurtleEntry {turtle} />
      {/each}
    </div>
    <div class="terminal">
      <Terminal/>
    </div>
  </div>
  <div class="viewport">
    <div class="top-bar">
      <Orders/>
    </div>
    <div class="canvas">
      <Canvas>
        <Scene />
      </Canvas>
    </div>
  </div>
  <div class="overlay">
    {#each selected as turtle (turtle.label)}
      <div class="turtle-inventory">
        <TurtleWindow {turtle}/>
      </div>
    {/each}
  </div>
  {#if $openOverlay}
    <div class="menu-overlay">
      {#if $openOverlay === "location"}
        <LocationOverlay/>
      {/if}
    </div>
  {/if}
  {#if $tooltip}
    <div class="tooltip" style="left: {mouse.x + 10}px; top: {mouse.y + 10}px">
      {$tooltip}
    </div>
  {/if}
</div>

<style>
  .main {
    height: 100vh;
    display: flex;
    flex-direction: row;
  }

  .menu-overlay {
    height: 100%;
    width: 100%;
    position: fixed;
    left: 0;
    top: 0;
    background-color: rgba(23, 23, 23, 0.2);
  }

  .overlay {
    margin-top: 60px;
    width: 80%;
    position: fixed;
    left: 20%;
    top: 0;
    pointer-events: none;
    display: flex;
    align-items: start;
  }

  .overlay * {
    pointer-events: all;
  }

  .turtle-inventory {
    margin: 12px;
    padding: 12px;
    background: darkslategray;
  }

  .sidebar-left {
    width: 20%;
    height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .top-bar {
    width: 100%;
    height: 60px;
    background: #1f3636;
  }

  .canvas {
    flex-grow: 1;
  }

  .turtle-list {
    background: darkslategray;
    overflow: auto;
    flex-grow: 1;
  }

  .terminal {
    height: 40%;
  }

  .viewport {
    width: 80%;
    display: flex;
    flex-direction: column;
  }

  .tooltip {
    background-color: rgba(23, 23, 23, 0.6);
    padding: 10px;
    font-size: large;
    position: absolute;
    pointer-events: none;
  }
</style>
