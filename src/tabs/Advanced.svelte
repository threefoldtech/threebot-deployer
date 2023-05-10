<svelte:options tag="tf-advanced-tab" />

<script lang="ts">
  import type { DeployerForm } from '../Deployer.svelte';
  const { Input, CheckBox } = window.tfSvelteBulmaWc;
  import SelectNodeId from '../components/SelectNodeId.svelte';
  import SelectGateway from '../components/SelectGateway.svelte';
  import { onDestroy, onMount } from 'svelte';
  import type { Unsubscriber } from 'tf-svelte-rx-forms/dist/internals/rx_store';

  export let show: boolean;
  export let deployer: DeployerForm;

  let unsubscribe: Unsubscriber;
  onDestroy(() => unsubscribe?.());
  onMount(function mount() {
    if (!deployer) requestAnimationFrame(mount);
  });
</script>

{#if deployer}
  <section style:display={show ? 'initial' : 'none'}>
    <Input
      label="CPU (vCores)"
      placeholder="CPU in vCores"
      type="number"
      controller={deployer.get('cpu')}
    />

    <Input
      label="Memory (MB)"
      placeholder="Memory in MB"
      type="number"
      controller={deployer.get('memory')}
    />

    <Input
      label="Disk (GB)"
      placeholder="Disk in GB"
      type="number"
      controller={deployer.get('disk')}
    />

    <CheckBox
      label="Planetary Network"
      controller={deployer.get('planetary')}
    />
    <CheckBox label="Public IPv4" controller={deployer.get('ipv4')} />

    <SelectGateway {deployer} />

    <SelectNodeId {deployer} />
  </section>
{/if}
