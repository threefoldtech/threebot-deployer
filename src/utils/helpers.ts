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

export function listenUntillUp(url: string): [Promise<true>, () => void] {
  let interval: any;
  return [
    new Promise<true>((resolve) => {
      interval = setInterval(() => {
        fetch(`${url}/api/v1/trends/statuses`)
          .then((res) => {
            if (res.status === 200) {
              resolve(true);
              clearInterval(interval);
            }
          })
          .catch(() => null);
      }, 10000);
    }),
    () => clearInterval(interval),
  ];
}
