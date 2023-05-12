<svelte:options tag="tf-deployer-list" />

<script lang="ts">
  import Modal from './components/ui/modals/Modal.svelte';
  import DeleteModal from './components/ui/modals/DeleteModal.svelte';
  import { getGrid, getNameAndGatewayContracts, deployer } from './utils';
  import { Decimal } from 'decimal.js';
  import type { Table } from 'tf-svelte-bulma-wc';

  const { Table, btn } = window.tfSvelteBulmaWc;
  const mnemonic = deployer.get('mnemonic');
  $: mnemonic$ = $mnemonic;

  let loading = false;
  let _openDeleteModal = false;
  let deployedData: any;
  let instances: any[] = [];
  let billingRate: any[] = [];
  let _index: number;
  let selectedInstances: string[] = [];

  function openDeleteModal(index?: number) {
    const indexs = typeof index === 'number' ? [index] : selected;
    for (const index of indexs) {
      if (!selectedInstances.includes(instances[index].name)) {
        selectedInstances.push(instances[index].name);
      }
    }

    _openDeleteModal = true;
    _index = index;
  }

  async function onDelete(index?) {
    deleting = true;
    const indexs = typeof index === 'number' ? [index] : selected;
    const __instances = table.rows.slice();
    const grid = await getGrid(mnemonic$.value);

    for (const index of indexs) {
      deletingIndex = index;
      let contractIds = await getNameAndGatewayContracts(
        mnemonic$.value,
        instances[index].name,
      );
      contractIds = contractIds.concat(instances[index].contractId);
      await Promise.all(
        contractIds.map((id) => {
          return grid.contracts.cancel({ id }).catch(() => null);
        }),
      );
      table.unselect(index);
      __instances[index] = null;
    }

    table.rows = __instances.filter((x) => x !== null);
    instances = instances.filter((_, i) => __instances[i] !== null);
    deletingIndex = undefined;
    deleting = false;
  }

  async function listDeployments() {
    try {
      loading = true;
      const grid = await getGrid(mnemonic$.value);
      const names = await grid.machines.list();
      const items = names.map((n) => grid.machines.getObj(n).catch(() => null));
      const _instances: any[] = [];
      const _billingRate: any[] = [];
      const rates: Promise<Decimal>[] = [];
      for await (const item of items) {
        const i = item?.at(0);
        if (i) {
          _instances.push(i);
          rates.push(
            Promise.all(
              (await getNameAndGatewayContracts(mnemonic$.value, i.name))
                .concat(i.contractId)
                .map((id) => grid.contracts.getConsumption({ id })),
            ).then((p) => p.reduce((a, b) => a.add(b), new Decimal('0'))),
          );
        }
      }
      for await (const item of rates) {
        _billingRate.push(
          item.isNaN() || item.lessThanOrEqualTo(0)
            ? 'No Data Available'
            : item.toFixed() + ' TFT/hour',
        );
      }
      instances = _instances;
      billingRate = _billingRate;
    } catch (e) {
      console.log(e);
    } finally{
      loading = false;
    }
  }

  let __mnemonicValid = false;
  $: if (mnemonic$.valid !== __mnemonicValid) {
    __mnemonicValid = mnemonic$.valid;
    if (mnemonic$.valid) listDeployments();
  }

  let selected: number[] = [];
  let deleting = false;
  let disableReload = false;
  let deletingIndex: number;
  let table: Table;

  export function reload() {
    return listDeployments();    
  }

  export function setDisabled(value: boolean) {
    disableReload = value;
  }
</script>

<b-box
  class:mb-6={true}
  class:p-6={true}
  style:font-family="'Lato', sans-serif"
>
  <b-content>
    <div class="is-flex is-justify-content-space-between is-align-items-center">
      <h2>Deployment List (Threebot Deployer)</h2>
      {#if mnemonic$.valid}
        <div>
          <button
            class:mr-2={true}
            use:btn={{ color: 'primary', loading, size: 'small' }}
            disabled={loading || deleting || !mnemonic$.valid || disableReload}
            on:click={listDeployments}
          >
            <b-icon icon="fa-solid fa-arrows-rotate" />
            Reload
          </button>
          <button
            use:btn={{ color: 'danger', loading: deleting, size: 'small' }}
            disabled={deleting || selected.length === 0}
            on:click={() => openDeleteModal()}
          >
            <b-icon icon="fa-solid fa-trash" />
            Delete
          </button>
        </div>
      {/if}
    </div>
    <hr />
  </b-content>

  {#if !mnemonic$.valid}
    <b-notification color="info" light>
      Please create account or insert your mnemonic in
      <strong> Credentials </strong> tab.
    </b-notification>
  {:else}
    {#if loading}
      <b-notification color="primary" light>
        Listing Deployments ...
      </b-notification>
    {:else if instances.length === 0}
      <b-notification color="info" light>
        No deployments were found.
      </b-notification>
    {:else}
      <div style:width="100%" style:overflow-x="auto">
        <Table
          bind:this={table}
          disabled={deleting}
          selectable
          fullwidth
          headers={[
            'name',
            'Public IPv4',
            'Planetary Network IP',
            'Billing Rate',
          ]}
          position={false}
          rows={instances.map((i, index) => {
            const ip = i.publicIP?.ip;
            return [i.name, ip || 'None', i.planetary, billingRate[index]];
          })}
          actions={[
            {
              label: 'Show Details',
              click(e) {
                deployedData = instances[e.index];
              },
              color: 'primary',
              icon: 'fa-solid fa-eye',
              disabled: () => deleting || disableReload,
            },
            {
              label: 'Open',
              click(e) {
                window.open(
                  `https://${instances[e.index].env.LOCAL_DOMAIN}`,
                  '_blank',
                );
              },
              color: 'link',
              icon: 'fa-solid fa-link',
              disabled: () => deleting || disableReload,
            },
            {
              label: 'Delete',
              click: ({ index }) => openDeleteModal(index),
              color: 'danger',
              icon: 'fa-solid fa-trash',
              loading: ({ index }) => deletingIndex === index && deleting,
              disabled: () => deleting || disableReload,
            },
          ]}
          on:select={({ detail }) => (selected = detail)}
        />
      </div>
    {/if}

    {#if deployedData}
      <Modal on:close={() => (deployedData = undefined)} data={deployedData} />
    {/if}

    {#if _openDeleteModal}
      <DeleteModal
        on:close={() => (_openDeleteModal = undefined)}
        on:isDelete={({ detail }) => {
          _openDeleteModal = false;
          selectedInstances = [];
          detail === true ? onDelete(_index) : false;
        }}
        on:close={() => {
          selectedInstances = [];
        }}
        {selectedInstances}
      />
    {/if}
  {/if}
</b-box>
