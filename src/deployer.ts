import './components/Terminal.svelte';
import Web3 from 'web3';
import { TerminalStatus, type TerminalComponent } from './utils/terminal';
import { metaMaskPK } from './utils/session';

const appTerminal: TerminalComponent = document.createElement('tf-terminal');
let displayDeployerComponent: boolean;

document.body.append(appTerminal);

function download(name: string) {
  const msg = `Importing ${name}`;
  appTerminal.commit('Installing dependencies', msg, TerminalStatus.responsed);
}

async function connectingToMetaMas() {
  appTerminal.commit(
    'Connecting to MetaMask',
    'Please ensure that you have installed the Metamask browser extension. This process may take a few seconds',
    TerminalStatus.pinding,
  );

  let web3: Web3;
  if (typeof window.ethereum !== 'undefined') {
    // Metamask is available
    web3 = new Web3(window.ethereum);

    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      const accounts = await web3.eth.getAccounts();
      const publicKey = accounts[0];

      if (publicKey) {
        appTerminal.commit(
          'Account Connected',
          `Wallet connected successfully, current selected account ${publicKey}`,
          TerminalStatus.success,
        );

        metaMaskPK.set(publicKey);
        displayDeployerComponent = true;
      }
    } catch (err) {
      metaMaskPK.set('');
      appTerminal.commit('MetaMask Error', err.message, TerminalStatus.failed);
    }
  } else {
    // Metamask is not available, rais an error in that case.
    metaMaskPK.set('');
    appTerminal.commit(
      'Connecting to MetaMask',
      'Failed to connect to MetaMask, Please ensure that you have installed the Metamask browser extension',
      TerminalStatus.pinding,
    );
  }
}

export async function main() {
  download('Grid3 Client');
  window.grid3_client = await import('@threefold/grid_client');

  download('Threefold Svelte Bulma Reactive Forms');
  window.tfSvelteRxForms = await import('tf-svelte-rx-forms');

  download('Threefold Svelte Bulma Web Components');
  window.tfSvelteBulmaWc = await import('tf-svelte-bulma-wc');

  download('Typescript RMB Http Client');
  window.tsRmbHttpClient = await import('ts-rmb-http-client');

  download('Web SSH Keygen');
  window.webSshKeygen = await import('web-ssh-keygen');

  download('threefold Grid Graphql');
  window.tfgridGql = await import('tfgrid-gql');

  download('QrCode');
  window.qrcode = await import('qrcode');

  await connectingToMetaMas();

  if (displayDeployerComponent) {
    download('Deployer');
    await import('./Deployer.svelte');
    appTerminal.remove();
  }
}

main();
