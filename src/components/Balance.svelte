<svelte:options tag="tf-deployer-balance" />

<script lang="ts">
  import { getBalance, deployer } from '../utils';
  const { btn } = window.tfSvelteBulmaWc;

  const mnemonic = deployer.get('mnemonic');
  let loading = false;
  let balance: { free: string; locked: string };

  $: mnemonic$ = $mnemonic;

  let __mnemonic: string;
  $: if (mnemonic$.valid && __mnemonic !== mnemonic$.value) {
    __mnemonic = mnemonic$.value;
    loadBalance();
  }

  async function loadBalance() {
    loading = true;
    getBalance(mnemonic$.value)
      .then(({ free, feeFrozen }) => {
        balance = { free: free.toFixed(2), locked: feeFrozen.toFixed(2) };
      })
      .finally(() => {
        loading = false;
      });
  }
</script>

<b-box
  style:border="1px solid var(--main-purple)"
  style:background-color="transparent"
  style:box-shadow="none"
  class:is-flex={true}
  class:is-flex-direction-column={true}
  class:mb-2={true}
>
  {#if loading}
    <p>
      <strog>Loading...</strog>
    </p>
  {:else if balance}
    <p style:white-space="nowrap" class="mb-1">
      Balance: <strong>{balance.free} TFT</strong>
    </p>
    <p style:white-space="nowrap">
      <strong>
        <a
          href="https://library.threefold.me/info/manual/#/manual__tfchain_home?id=contract-locking"
          target="_blank"
          rel="noreferrer"
          class="is-underlined"
        >
          Locked
        </a>
      </strong>: <strong>{balance.locked} TFT</strong>
    </p>
  {:else}
    <p>Couldn't Load balance.</p>
  {/if}
  <div class="is-flex" style:margin-top="auto">
    <button
      use:btn={{
        color: 'primary',
        outlined: true,
        fullwidth: true,
        loading,
      }}
      disabled={loading}
      class:py-0={true}
      on:click={loadBalance}
    >
      <b-icon icon="fa-solid fa-rotate-right">Reload</b-icon>
    </button>
  </div>
</b-box>
