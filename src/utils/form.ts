/* eslint-disable max-len */
import type { FormControl } from 'tf-svelte-rx-forms';
import type { Unsubscriber } from 'tf-svelte-rx-forms/dist/internals/rx_store';
import type { FCE } from 'tf-svelte-rx-forms/dist/modules/form_control';
import { getGrid, getBalance } from '.';
import { checkNode } from './deploy';
import { generateString } from './helpers';
import { ismnemonic, isValidSSH } from './validators';

const { fb, validators } = window.tfSvelteRxForms;

export const noBalanceMessage = 'Your balance is not enough.';
export const deployer = fb.group({
  mnemonic: [
    '',
    [validators.required('Mnemonic required.'), ismnemonic],
    [
      async (ctrl) => {
        try {
          await getGrid(ctrl.value);
        } catch (e) {
          console.log(e);

          return {
            message: `
          <strong>
            Couldn't load grid using these mnemonic.
          </strong>
          <p>
            Read more about how to activate an account using our 
              <a
                href="https://library.threefold.me/info/manual/#/getstarted/manual__dashboard_portal_polkadot_create_account"
                target="_blank">
                manual
              </a>
          </p>
          </br>
          `,
          };
        }
      },
      async (ctrl) => {
        const userBalance = await getBalance(ctrl.value);
        if (userBalance.free < 0.001) {
          return { message: noBalanceMessage + 'From here' };
        }
      },
    ],
  ],
  sshKey: [
    '',
    [
      validators.required('Public SSH Key is required.'),
      isValidSSH('Public SSH Key doesn\'t seem to be valid.'),
    ],
  ],

  name: [
    generateString(10, window.config.projectNamePrefix),
    [
      validators.required('deployer instance\'s name is required.'),
      validators.isAlphanumeric(
        'Name can only include alphanumeric characters.',
      ),
      validators.minLength('Name must be at least 2 chars.', 2),
      validators.maxLength('Name maxLength is 15 chars.', 15),
    ],
  ],
  flist: [
    'https://hub.grid.tf/tf-official-vms/ubuntu-22.04.flist',
    [
      validators.required('deployer instance\'s flist is required.'),
      validators.isURL('The flist should be a link.'),
    ],
  ],
  entryPoint: [
    '/usr/bin/python3 -m http.server --bind ::',
    [validators.required('deployer instance\'s entry point is required.')],
  ],
  cpu: [
    2,
    [
      validators.required('Cpu is required.'),
      validators.isInt('Cpu must be a valid integer.', {
        allow_leading_zeroes: false,
      }),
      validators.min('Cpu min cores is 1.', 1),
      validators.max('Cpu max cores is 32.', 32),
    ],
  ],
  memory: [
    4096,
    [
      validators.required('Memory is required.'),
      validators.isInt('Memory must be a valid integer.', {
        allow_leading_zeroes: false,
      }),
      validators.min('Minimum allowed memory is 2048 MB.', 2048),
      validators.max('Maximum allowed memory is 256 GB.', 262144),
    ],
  ],
  disk: [
    20,
    [
      validators.required('Disk is required.'),
      validators.isInt('Disk must be a valid integer.', {
        allow_leading_zeroes: false,
      }),
      validators.min('Minimum allowed disk size is 20 GB.', 20),
      validators.max('Maximum allowed disk size is 10000 GB.', 10000),
    ],
  ],
  planetary: [true],
  ipv4: [false],
  gateway: [null as string, [validators.required('Gateway is required.')]],
  nodeId: [
    null as number,
    [validators.required('Node ID is required.')],
    [isNodeUp],
  ],

  region: [null as string, [getErrorFromCtx]],
  certified: [false, [getErrorFromCtx]],
});

const mnemonic = deployer.get('mnemonic');
let unsub: Unsubscriber;
// eslint-disable-next-line prefer-const
unsub = mnemonic.subscribe((mn) => {
  if (mn.value.length > 0 && !mnemonic.valid) {
    mnemonic.markAsDirty();
    mnemonic.markAsTouched();
    unsub?.();
  }
});

export function getErrorFromCtx<T extends FCE>(
  _: FormControl<T>,
  ctx?: { error: string },
) {
  if (ctx?.error) {
    return { message: ctx.error };
  }
}

export async function isNodeUp(ctrl: FormControl<number>) {
  try {
    await checkNode(deployer.get('mnemonic').value, +ctrl.value);
  } catch {
    return { message: `Node(${ctrl.value}) is offline.` };
  }
}
