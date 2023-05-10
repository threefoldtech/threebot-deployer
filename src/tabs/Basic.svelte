<svelte:options tag="tf-basic-tab" />

<script lang="ts">
  import type { DeployerForm } from '../Deployer.svelte';
  import { regions } from '../regions';
  const { Input, Select, CheckBox } = window.tfSvelteBulmaWc;

  export let show: boolean;
  export let deployer: DeployerForm;
</script>

{#if deployer}
  <section style:display={show ? 'initial' : 'none'}>
    <Input
      label="Threebot Deployer Instance Name"
      sublabel="Instance name is used for managing the deployed instance and to create a subdomain"
      placeholder="Instance name is used for managing the deployed instance and to create a subdomain"
      controller={deployer.get('name')}
    />

    <Input
      label="Flist"
      placeholder="Instance name is used for managing the deployed instance and to create a subdomain"
      controller={deployer.get('flist')}
    />

    <Input
      controller={deployer.get('entryPoint')}
      label="Entry Point"
      placeholder="/init.sh"
    />

    <Select
      label="Region"
      controller={deployer.get('region')}
      options={[
        { label: 'All', value: null },
        ...Object.keys(regions).map((r) => ({ label: r, value: r })),
      ]}
    />

    <div class="is-flex">
      <CheckBox
        label="<strong><a href='https://library.threefold.me/info/threefold/#/tfgrid/pricing/threefold__certified_farming' target='_blank' class='mr-1'>Certified</a>Hardware</strong>"
        controller={deployer.get('certified')}
      />
      <b-tooltip
        class:is-hidden-touch={true}
        tooltip="Deploy your instance on a Certified 3Node. Certified 3Nodes come with greater levels of security and performance along with other benefits."
        flow="right"
      >
        <div style:margin-top="6px">
          <b-icon icon="fa-solid fa-circle-question" />
        </div>
      </b-tooltip>
    </div>
  </section>
{/if}
