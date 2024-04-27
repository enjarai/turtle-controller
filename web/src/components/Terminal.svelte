<script lang="ts">
    import type { ResponseData } from "@shared/types";
    import { selectedTurtles } from "../selection";
    import { sendCommand } from "../turtles";

    let responses: ResponseData[] = [];
    let input: string;
    let responseDiv: HTMLDivElement;

    function submit(e: KeyboardEvent) {
        e.preventDefault();
        if ($selectedTurtles.length > 0) {
            for (const turtle of $selectedTurtles) {
                sendCommand(turtle, input).then(result => {
                    responses = [...responses, {
                        source: turtle.label,
                        timestamp: new Date(),
                        data: result,
                    }];
                }).catch(err => {
                    responses = [...responses, {
                        source: turtle.label,
                        timestamp: new Date(),
                        data: err,
                        error: true,
                    }];
                });
            }
            if (!input.includes("\n")) {
                input = "";
            }
        }
    }

    function scrollDown(_: HTMLDivElement) {
        responseDiv.scrollTop = responseDiv.scrollHeight
    }
</script>

<div class="terminal">
  <div class="responses" bind:this={responseDiv}>
    {#each responses as response (response.timestamp)}
      <div class="response" class:error={response.error} use:scrollDown>
        {response.source}: {JSON.stringify(response.data, undefined, 2)}
      </div>
    {/each}
  </div>
  <div class="prompt-container">
    <textarea class="prompt"
              bind:value={input}
              on:keypress|stopPropagation={(e) => e.key === "Enter" && !e.shiftKey && submit(e)}
    ></textarea>
  </div>
</div>

<style>
  .terminal {
      display: flex;
      flex-direction: column;
      height: 100%;
  }

  .responses {
      overflow-y: auto;
      background-color: #262626;
      flex-grow: 1;
  }

  .response {
      border-top: darkslategray solid 1px;
      border-bottom: darkslategray solid 1px;
      padding: 5px;
  }

  .response.error {
      background-color: darkred;
      border-top: red solid 1px;
      border-bottom: red solid 1px;
  }

  .prompt-container {
      height: 200px;
  }

  .prompt {
      width: 100%;
      height: 200px;
      box-sizing: border-box;
      background-color: #1c1c1c;
      border: none;
      color: white;
  }

  .prompt:focus {
      outline: greenyellow solid 2px;
  }
</style>