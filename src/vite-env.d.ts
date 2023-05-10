/// <reference types="svelte" />
/// <reference types="vite/client" />

import type * as grid3_client from '@threefold/grid_client';
import type * as tfSvelteBulmaWc from 'tf-svelte-bulma-wc';
import type * as tfSvelteRxForms from 'tf-svelte-rx-forms';
import type * as tsRmbHttpClient from 'ts-rmb-http-client';
import type * as webSshKeygen from 'web-ssh-keygen';
import type * as tfgridGql from 'tfgrid-gql';
import type qrcode from 'qrcode';
import type DeploymentList from './DeploymentList.svelte';
import type * as ethereum from '@web3';

declare global {
  interface Window {
    grid3_client: typeof grid3_client;
    tfSvelteBulmaWc: typeof tfSvelteBulmaWc;
    tfSvelteRxForms: typeof tfSvelteRxForms;
    tsRmbHttpClient: typeof tsRmbHttpClient;
    webSshKeygen: typeof webSshKeygen;
    tfgridGql: typeof tfgridGql;
    qrcode: typeof qrcode;
    deploymentList?: DeploymentList;
    ethereum: typeof ethereum;

    config: {
      network: string;
    };
  }
}
