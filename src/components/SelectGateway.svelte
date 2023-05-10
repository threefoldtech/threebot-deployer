<svelte:options tag="tf-select-gateway" />

<script lang="ts">
  import { onMount } from 'svelte';
  const { Select } = window.tfSvelteBulmaWc;
  import type { DeployerForm } from '../Deployer.svelte';
  import { getGateways } from '../utils';

  export let deployer: DeployerForm;
  let gateways: [string, string][] = [];

  onMount(async () => {
    const gws = await getGateways(deployer.value.mnemonic);
    gateways = Object.keys(gws).map((id) => {
      return [(gws[id] as any).domain, id + ':' + (gws[id] as any).domain];
    });
    if (gateways.length) {
      deployer.get('gateway').setValue(gateways[0][1]);
    }
  });
</script>

{#if deployer}
  <Select
    label="Select Gateway Node"
    placeholder="Please select a gateway node"
    controller={deployer.get('gateway')}
    options={gateways.map(([label, value]) => ({ label, value }))}
  />
{/if}
