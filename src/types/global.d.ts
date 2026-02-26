/* eslint-disable no-var */
declare global {
  var io: { emit: (event: string, data: unknown) => void } | undefined;
  var emitEvent: ((event: string, data: unknown) => void) | undefined;
}

export {};
