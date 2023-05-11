<svelte:options tag="tf-terminal" />

<script lang="ts">
  import { TerminalStatus, type TerminalHistory } from '../utils/terminal';

  let pindingMessage: string;
  let intervalId: NodeJS.Timer | undefined;
  let logs: TerminalHistory[] = [];

  export function commit(
    _stateType: string,
    msg: string,
    sts: TerminalStatus,
  ) {
    // Display a message in the browser.
    logs = logs;
    logs.push({
      message: msg,
      state: _stateType,
      status: sts,
    });
  }

  const updateStatus = () => {
    logs = logs;
    if (logs.length) {
      const lastMessage = logs[logs.length - 1];
      switch (lastMessage.status) {
      case TerminalStatus.pinding:
        console.log('pinding', lastMessage.status);
        let counter = 1;
        intervalId = setInterval(() => {
          const dots = '.'.repeat(counter);
          pindingMessage = `${lastMessage.message}${dots}`;
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
    <div class="box">
      <small>Threebot deployer logger @Threefold Tech</small>

      {#if logs && logs.length}
        {#each logs as log}
          <div style:margin-top="3px">
            {log.status === TerminalStatus.failed ? '-' : '+'}
            <span style:color="white">{log.state} |</span>
            <span
              style:color={log.status === TerminalStatus.failed
                ? 'red'
                : 'wheat'}
            >
              {log.status === TerminalStatus.pinding && pindingMessage
                ? pindingMessage
                : log.message}
            </span>
          </div>
        {/each}
      {/if}
    </div>
  </div>
</div>
