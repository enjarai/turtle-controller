<script lang="ts">

import { openOverlay } from "../misc";
</script>

<div class="window">
  <slot/>
  <div class="footer">
    <hr>
    <button on:click={() => $openOverlay = null}>Close</button>
  </div>
</div>

<style>
  .window {
      margin: 200px auto 0;
      background-color: darkslategray;
      min-width: 600px;
      box-shadow: #171717 10px 10px 20px;
      padding: 20px;
  }

  .footer {
      display: flex;
      align-items: center;
  }

  .footer hr {
      margin: 20px;
  }
</style>