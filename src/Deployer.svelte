<svelte:options tag="tf-deployer" />

<script context="module" lang="ts">
  const { Tabs } = window.tfSvelteBulmaWc;
  const { events } = window.grid3_client;

  import Credentials from './tabs/Credentials.svelte';
  import Advanced from './tabs/Advanced.svelte';
  import {
    generateString,
    deployVM,
    getDomainName,
    deployGateway,
    deployer,
    checkNode,
    metaMaskPK,
  } from './utils';
  import Basic from './tabs/Basic.svelte';

  export type DeployerForm = typeof deployer;
</script>

<script lang="ts">
  import Modal from './components/ui/modals/Modal.svelte';
  import type { FormControlValue } from 'tf-svelte-rx-forms/dist/types';
  import { TerminalStatus, type TerminalComponent } from './utils/terminal';
  const { btn } = window.tfSvelteBulmaWc;

  let active = 'credentials';
  $: deployer$ = $deployer;
  $: mnemonic = deployer$.value.mnemonic;
  $: sshKey = deployer$.value.sshKey;
  $: validCredentials = mnemonic.valid && sshKey.valid;
  let terminal: TerminalComponent;

  let deploying = false;
  let error = false;
  let success = false;
  let message = '';
  let deployedData: any;
  let showDeployedData = false;
  let isUp = false;
  async function onDeploy() {
    const { value } = deployer;

    try {
      // Will throw and error if node currently Down.
      await checkNode(value.mnemonic, value.nodeId);
    } catch {
      // Revalidate nodeId to verify that node still up
      await deployer.get('nodeId').validate();

      // Trigger validation for any fields of selectNodeID
      // to verify that node still UP
      deployer.get('certified').setValue(deployer$.value.certified.value);
    }

    if (!deployer.valid) {
      deployer.markAsDirty();
      deployer.markAsTouched();

      requestAnimationFrame(() => {
        if (basicHasError) {
          requestAnimationFrame(() => {
            active = 'basic';
            // prettier-ignore
            requestAnimationFrame(() => {
              if (!v$.name.valid) deployer.get('name')['__input']?.focus();
            });
          });
        } else if (advancedHasError) {
          requestAnimationFrame(() => {
            active = 'advanced';
            // prettier-ignore
            requestAnimationFrame(() => {
              if (!v$.cpu.valid) deployer.get('cpu')['__input']?.focus();
              else if (!v$.memory.valid) deployer.get('memory')['__input']?.focus();
              else if (!v$.disk.valid) deployer.get('disk')['__input']?.focus();
            });
          });
        }
      });

      return;
    }

    deploying = true;
    window.deploymentList?.setDisabled(true);
    error = false;
    success = false;

    try {
      events.addListener(
        'logs',
        (msg: any) => (
          (message = msg),
          terminal.commit('Deployment stage', message, TerminalStatus.requested)
        ),
      );

      const domainName = await getDomainName(value.mnemonic, value.name);
      const [publicNodeId, nodeDomain] = value.gateway.split(':');

      const vm = await deployVM({
        ...deployer.value,
        image: {
          flist: deployer.value.flist,
          entryPoint: deployer.value.entryPoint,
        },
        rootFsSize: 2,
        disks: [
          {
            name: generateString(15, 'disk'),
            mountPoint: '/var/lib/docker',
            size: value.disk,
          },
        ],
        envs: [
          { key: 'SSH_KEY', value: value.sshKey },
          { key: 'TFCHAIN_KEY', value: value.mnemonic },
          { key: 'ETH_PUBLIC_KEY', value: $metaMaskPK },
          { key: 'LOCAL_DOMAIN', value: `${domainName}.${nodeDomain}` },
        ],
        metadata: JSON.stringify({
          type: 'vm',
          name: deployer.value.name,
          projectName: 'ThreebotDeployer',
        }),
      });

      await deployGateway({
        domainName,
        mnemonic: value.mnemonic,
        planetaryIp: vm[0]['planetary'] as string,
        publicNodeId: +publicNodeId,
        metadata: JSON.stringify({
          type: 'gateway',
          name: domainName,
          projectName: 'ThreebotDeployer',
        }),
      });

      deployedData = vm;
      success = true;
      message = 'Successfully deployed.';
      terminal.commit('Deployment stage', message, TerminalStatus.success);
      window.deploymentList?.reload();
      window.deploymentList?.setDisabled(false);
      isUp = true;
      showDeployedData = true;
    } catch (e) {
      console.log(e);
      message = e.message;
      terminal.commit('Deployment stage', message, TerminalStatus.failed);
      error = true;
    }

    events.removeAllListeners('logs');
  }

  function isNotValid(...fields$: FormControlValue<any>[]): boolean {
    for (const field$ of fields$) {
      if (!field$.valid && (field$.touched || field$.dirty)) {
        return true;
      }
    }
    return false;
  }

  $: v$ = deployer$.value;
  $: credentialsHasError = isNotValid(v$.mnemonic, v$.sshKey);
  $: basicHasError = isNotValid(
    v$.name,
    v$.region,
    v$.flist,
    v$.entryPoint,
    v$.certified,
  );
  $: advancedHasError = isNotValid(
    v$.cpu,
    v$.memory,
    v$.disk,
    v$.gateway,
    v$.nodeId,
  );
</script>

<b-box
  class:p-6={true}
  class:mt-5={true}
  class:is-size-5={true}
  style:font-family="'Lato', sans-serif"
>
  <b-content>
    <h2 class="has-text-centered is-size-1 mt-0">Threebot Deployer</h2>
    <p>
      Threebot deployer app makes it simple and hassle-free to deploy your own
      web3 proxy, With user-friendly interface, you can create and manage your
      Threebot with ease, while our key management system ensures that your
      authentication and verification processes are secure and reliable. Whether
      you're a seasoned blockchain developer or just starting out, our deployer
      app streamlines the deployment process so that you can focus on what
      matters most - building and deploying your web3 proxy.
    </p>
    <hr />
  </b-content>
  <section>
    <section class:d-none={deploying} style:margin-top="35px">
      <Tabs
        bind:active
        tabs={[
          {
            id: 'credentials',
            label: 'Credentials',
            error: credentialsHasError,
          },
          ...(validCredentials
            ? [
                { id: 'basic', label: 'Basic', error: basicHasError },
                {
                  id: 'advanced',
                  label: 'Advanced',
                  error: advancedHasError,
                },
              ]
            : []),
        ]}
      />
    </section>

    <form on:submit|preventDefault={onDeploy} class="p-2">
      <section class:d-none={deploying}>
        <Credentials show={active === 'credentials'} />

        {#if validCredentials}
          <Basic {deployer} show={active === 'basic'} />
          <Advanced {deployer} show={active === 'advanced'} />
        {/if}
      </section>

      <section class:d-none={!deploying}>
        <tf-terminal bind:this={terminal} />
      </section>

      <div class="is-flex mt-2 is-align-items-center">
        <button
          use:btn={{
            color: deploying ? 'info' : 'primary',
            loading: deploying && !error && !success,
          }}
          class:py-0={true}
          type={deploying ? 'button' : 'submit'}
          disabled={credentialsHasError ||
            (deploying && !error && !success) ||
            deployedData ||
            showDeployedData}
          on:click={deploying
            ? (e) => {
                e.preventDefault();
                deploying = false;
                success = false;
                error = false;
                isUp = false;
              }
            : undefined}
        >
          {deploying ? 'Back' : 'Deploy'}
        </button>
        <div style:width="100%" class="ml-2">
          {#if isUp}
            <b-notification color="success" light>
              <b-icon icon="fa-solid fa-circle-check" />
              Your deployment is up and running.
            </b-notification>
          {/if}
        </div>
      </div>
    </form>
  </section>

  {#if deployedData && showDeployedData}
    <Modal
      on:close={() => {
        deployedData = undefined;
        showDeployedData = false;
      }}
      data={deployedData}
    />
  {/if}
</b-box>
