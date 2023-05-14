<svelte:options tag="tf-terminal" />

<script lang="ts">
  import { TerminalStatus, type TerminalHistory } from '../utils/terminal';

  let pendingMessage: string;
  let intervalId: NodeJS.Timer | undefined;

  let logs: TerminalHistory[] = [];
  let logger: HTMLDivElement;

  export function commit(
    _stateType: string,
    msg: string,
    sts: TerminalStatus,
  ): void {
    // Display a message in the browser.
    logs = logs;
    logs.push({
      message: msg,
      state: _stateType,
      status: sts,
    });
    requestAnimationFrame(() => {
      logger.scrollTop = logger.scrollHeight;
    })
  }

  const updateStatus = () => {
    logs = logs;
    if (logs.length) {
      const lastMessage = logs[logs.length - 1];
      switch (lastMessage.status) {
      case TerminalStatus.pending:
        let counter = 1;
        intervalId = setInterval(() => {
          const dots = '.'.repeat(counter);
          pendingMessage = `${lastMessage.message}${dots}`;
          counter = (counter % 3) + 1;
        }, 500);
        break;
      default:
        // handle other statuses here
        if (intervalId !== undefined) {
          clearInterval(intervalId);
        }
        break;
      }
    }
  };

  $: logs, updateStatus();
</script>

<div
  style:margin-top="30px"
  style:margin-bottom="20px"
  style:width="100%"
  style:display="flex"
  style:justify-content="center"
  style:align-items="center"
>
  <div class="terminal">
    <div class="header">
      <div class="dot dot-red" />
      <div class="dot dot-yellow" />
      <div class="dot dot-green" />
    </div>
    <div class="box" bind:this={logger}>
      <small>Threebot deployer logger @Threefold Tech</small>

      {#if logs && logs.length}
        {#each logs as log}
          <div style:margin-top="3px" style:margin-bottom="7px">
            {log.status === TerminalStatus.failed ? '-' : '+'}
            <span style:color="white">{log.state} |</span>
            <span
              style:color={log.status === TerminalStatus.failed
                ? 'red'
                : 'wheat'}
            >
              {log.status === TerminalStatus.pending && pendingMessage
                ? pendingMessage
                : log.message}
            </span>
          </div>
        {/each}
      {/if}
    </div>
  </div>
</div>

<style>
  .terminal .box {
    width: 800px;
    background: #161616;
    height: 400px;
    color: wheat;
    border-radius: 0px 0px 15px 15px;
    padding: 5px;
    overflow-x: hidden;
    overflow-y: scroll;
  }
  .terminal .header {
    width: 100%;
    background: #282c2b;
    height: 25px;
    border-radius: 15px 15px 0px 0px;
    position: relative;
  }
  .terminal .dot-red {
    background: #ff1111;
    left: 15px;
  }
  .terminal .dot-yellow {
    background: #ecb80c;
    left: 35px;
  }
  .terminal .dot-green {
    background: #53ec0c;
    left: 55px;
  }
  .terminal .dot {
    position: absolute;
    width: 2px;
    top: 6px;
    height: 2px;
    padding: 5px;
    border-radius: 50%;
    border: 0.1px solid #ffffff57;
  }
</style>
