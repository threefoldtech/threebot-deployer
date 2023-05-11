<svelte:options tag="tf-credentials-tab" />

<script lang="ts">
  import { getGrid, noBalanceMessage, Session } from '../utils';
  import Qrcode from '../components/Qrcode.svelte';
  import type { NetworkEnv } from '@threefold/grid_client';
  import { onDestroy, onMount } from 'svelte';
  import { deployer } from '../utils';
  import { default as urlParser } from 'url-parse';

  export let show: boolean;

  const { Input, btn } = window.tfSvelteBulmaWc;
  const { generateKeyPair } = window.webSshKeygen;

  let __init = false;
  $: if (deployer) {
    deployer$;

    if (__init) {
      Session.write(Session.Keys.Credentials, deployer.value.mnemonic);
    } else {
      requestAnimationFrame(() => {
        __init = true;
        const value = Session.read(Session.Keys.Credentials);
        if (value) {
          deployer.get('mnemonic').setValue(value);
        }
      });
    }
  }

  const bridge =
    window.config.network === 'main'
      ? 'GBNOTAYUMXVO5QDYWYO2SOCOYIJ3XFIP65GKOQN7H65ZZSO6BK4SLWSC'
      : window.config.network === 'test'
      ? 'GA2CWNBUHX7NZ3B5GR4I23FMU7VY5RPA77IUJTIXTTTGKYSKDSV6LUA4'
      : 'GDHJP6TF3UXYXTNEZ2P36J5FH7W4BJJQ4AYYAXC66I2Q2AH5B6O6BCFG';
  let twinId: number;
  let __mnemonic2: string;
  $: if (isMnemonicValid && __mnemonic2 !== mnemonic$.value) {
    __mnemonic2 = mnemonic$.value;
    getGrid(deployer$.value.mnemonic.value)
      .then((grid) => grid.twins.get_my_twin_id())
      .then((t) => (twinId = t));
  }

  let accountCreationStatus: 'None' | 'Creating' | 'Error' | 'Done' = 'None';
  let creationMsg: string;
  async function onCreateAccount() {
    try {
      accountCreationStatus = 'Creating';
      const { GridClient } = window.grid3_client;

      const network = window.config.network as NetworkEnv;
      const client = new GridClient({
        mnemonic: '',
        network,
        storeSecret: 'omda',
      });

      client._connect();

      const urls = client.getDefaultUrls(window.config.network as NetworkEnv);
      const relay = urlParser(urls.relay).hostname;
      const createdAccount = await client.tfchain.createAccount(relay);

      deployer.get('mnemonic').setValue(createdAccount.mnemonic);
      await deployer.get('mnemonic').validate();
      creationMsg =
        'Please make sure to store your mnemonic somewhere safe to be able to access your deployments later on. There is no way for neither you nor ThreeFold nor anybody else to recover lost mnemonic.';
      accountCreationStatus = 'Done';

      client.disconnect();
    } catch (e) {
      accountCreationStatus = 'Error';
      creationMsg = e;
    }
  }

  let sshInfoMessage: string;
  let readingSSH = false;
  let __ssh: string;
  let __mnemonic: string;
  let __1 = false;
  $: if (mnemonic$?.valid && !sshKey$?.valid && !readingSSH && !__1) {
    __1 = true;
    readingSSH = true;
    sshInfoMessage = 'Reading Your SSH Key...';
    const key = 'metadata';
    getGrid(mnemonic$.value)
      .then(async (grid) => {
        const value = await grid.kvstore.get({ key });
        if (value !== '') {
          requestAnimationFrame(() => {
            __ssh = JSON.parse(value).sshkey;
            __mnemonic = mnemonic$.value;
            deployer.get('sshKey').setValue(__ssh.trim());
          });
        }
      })
      .finally(() => (readingSSH = false));
  }

  let storingSSH = false;
  $: if (
    mnemonic$?.valid &&
    sshKey$?.valid &&
    (sshKey$?.value !== __ssh || mnemonic$?.value !== __mnemonic) &&
    !storingSSH
  ) {
    __ssh = sshKey$.value;
    __mnemonic = mnemonic$.value;
    storingSSH = true;
    sshInfoMessage = 'Storing Your SSH Key...';

    getGrid(mnemonic$.value)
      .then((grid) => {
        return grid.kvstore.set({
          key: 'metadata',
          value: JSON.stringify({ sshkey: __ssh }),
        });
      })
      .finally(() => (storingSSH = false));
  }

  let sshMessage: string;
  let generatingSSH = false;
  async function onGenerateSSH() {
    generatingSSH = true;
    sshInfoMessage = 'Generating Your SSH Key...';

    const keys = await generateKeyPair({
      alg: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256',
      name: 'Threefold',
      size: 4096,
    });

    try {
      const grid = await getGrid(deployer$.value.mnemonic.value);
      await grid.kvstore.set({
        key: 'metadata',
        value: JSON.stringify({ sshkey: keys.publicKey }),
      });
    } catch (e) {
      sshMessage = e.message;
    }

    deployer.get('sshKey').setValue(keys.publicKey);
    await deployer.get('sshKey').validate();

    const data = `data:text/raw;charset=utf-8,${encodeURIComponent(
      keys.privateKey,
    )}`;
    const a = document.createElement('a');
    a.download = 'id_rsa';
    a.href = data;
    document.body.appendChild(a);
    a.click();
    a.remove();

    generatingSSH = false;
  }

  $: deployer$ = $deployer;
  $: mnemonic$ = deployer$?.value.mnemonic;
  $: sshKey$ = deployer$?.value.sshKey;
  $: pending = mnemonic$?.pending;
  $: creating = accountCreationStatus === 'Creating';
  $: isMnemonicValid = mnemonic$
    ? mnemonic$.valid ||
      (!mnemonic$.valid && mnemonic$.error === noBalanceMessage)
    : false;

  let self: HTMLElement;
  window.onresize = updateBtnsMargin;
  onMount(updateBtnsMargin);
  onDestroy(() => {
    window.onresize = null;
  });

  function updateBtnsMargin() {
    // prettier-ignore
    for (const child of self.children) {
      const btn = child.querySelector('button');
      const inp = child.querySelector('input') || child.querySelector('textarea');
      try {
        const y = inp.getBoundingClientRect().top - child.getBoundingClientRect().top;
        if (btn && inp) {
          btn.style.marginTop = `${y}px`;
        }
      } catch {
        requestAnimationFrame(updateBtnsMargin);
      }
    }
  }

  let __mnemonicIsValid = false;
  $: if (!mnemonic$.valid && __mnemonicIsValid) {
    __mnemonicIsValid = false;
    deployer.get('sshKey').reset();
    __1 = false;
  } else if (mnemonic$.valid && !__mnemonicIsValid) {
    __mnemonicIsValid = true;
  }
</script>

<section style:display={show ? 'initial' : 'none'} bind:this={self}>
  <div class="is-flex is-jutify-content-center">
    <div style:width="100%">
      <Input
        label="Mnemonic"
        placeholder="Mnemonic"
        sublabel="Mnemonic are your private key. They are used to represent you on the ThreeFold Grid. You can paste existing mnemonic or click the 'Create Account' button to create an account and generate mnemonic."
        type="password"
        controller={deployer.get('mnemonic')}
        disabled={creating}
        validation={!(pending || creating)}
        hint={mnemonic$.pending
          ? 'Validating mnemonic...'
          : accountCreationStatus === 'Error'
          ? creationMsg
          : undefined}
        hintColor={mnemonic$.pending
          ? 'info'
          : accountCreationStatus === 'Error'
          ? 'danger'
          : undefined}
      />
    </div>
    <button
      type="button"
      class:ml-2={true}
      style:margin-top="78px"
      use:btn={{
        color: 'primary',
        size: 'small',
        loading: pending || creating,
      }}
      on:click={onCreateAccount}
      disabled={mnemonic$.valid || pending || creating}
    >
      Create Account
    </button>
  </div>
  {#if accountCreationStatus === 'Done' && creationMsg}
    <b-notification color="warning" light class:my-2={true}>
      <b-icon icon="fa-sharp fa-solid fa-triangle-exclamation" />
      {creationMsg}
    </b-notification>
  {/if}

  {#if (mnemonic$.valid || (!mnemonic$.valid && mnemonic$.error === noBalanceMessage)) && twinId}
    <Qrcode data="TFT:{bridge}?message=twin_{twinId}&sender=me&amount=100" />
  {/if}

  <div class="is-flex is-jutify-content-center mb-2">
    <div style:width="100%">
      <Input
        label="Public SSH Key"
        type="textarea"
        placeholder="Your public SSH Key"
        sublabel="
        SSH Keys are used to authenticate you to the Threebot Deployer instance for management purposes.
        If you don't have an SSH Key or are not familiar, we can generate one for you.
        "
        controller={deployer.get('sshKey')}
        loading={readingSSH || generatingSSH || storingSSH}
        disabled={!mnemonic$.valid || readingSSH || generatingSSH || storingSSH}
        hint={sshMessage ||
          (readingSSH || generatingSSH || storingSSH
            ? sshInfoMessage
            : undefined)}
        validation={!(readingSSH || generatingSSH || storingSSH)}
        hintColor={readingSSH || generatingSSH || storingSSH
          ? 'info'
          : undefined}
      />
    </div>

    <button
      type="button"
      class:ml-2={true}
      style:margin-top="78px"
      use:btn={{
        color: 'primary',
        size: 'small',
        loading: readingSSH || generatingSSH || storingSSH,
      }}
      on:click={onGenerateSSH}
      disabled={!mnemonic$.valid ||
        readingSSH ||
        generatingSSH ||
        storingSSH ||
        sshKey$.valid}
    >
      Generate SSH Key
    </button>
  </div>
</section>
