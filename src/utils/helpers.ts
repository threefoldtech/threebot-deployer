import { TerminalStatus, type TerminalComponent } from './terminal';

const NUMBERS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const ALPHA = Array.from({ length: 26 }, (_, i) => String.fromCharCode(97 + i));
const ALL = [...NUMBERS, ...ALPHA];

export function generateString(
  length = 10,
  prefix: string = getRandomValue(ALPHA),
): string {
  length = length - prefix.length;
  for (let i = 0; i < length; i++) prefix += getRandomValue(ALL);
  return prefix;
}

export function getRandomValue<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

export function listenUntilUp(url: string, terminal: TerminalComponent): [Promise<true>, () => void] {
  const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
  let interval: NodeJS.Timeout;
  terminal.commit(
    'Listener stage',
    'Waiting for your instance to be up and running',
    TerminalStatus.pending
  );
  return [
    new Promise<true>((resolve, reject) => {
      interval = setInterval(() => {
        fetch(proxyUrl + url)
          .then((res) => {
            console.log('res', res);
            if (res.ok) {
              resolve(true);
              clearInterval(interval);
              terminal.commit(
                'Listener stage',
                'The server is up & running',
                TerminalStatus.pending
              );
            } else {
              terminal.commit(
                'Listener stage',
                `Server responded with status code ${res.status}`,
                TerminalStatus.pending
              );
            }
          })
          .catch((error) => {
            terminal.commit(
              'Listener stage',
              `Error occurred while trying to connect to server: ${error}`,
              TerminalStatus.failed
            );
            reject(error);
          });
      }, 10000);
    }),
    () => clearInterval(interval),
  ];
}