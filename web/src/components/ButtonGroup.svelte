<script lang="ts">

</script>

<div class="button-group">
  <slot/>
</div>

<style>
  .button-group {
      margin: 4px;
      display: flex;
      flex-direction: column;
  }

  .button-group > button {
      margin: 0;
  }
</style>