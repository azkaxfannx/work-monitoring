import type { Server } from "socket.io";

declare global {
  // eslint-disable-next-line no-var
  var io: Server | undefined;
  // eslint-disable-next-line no-var
  var emitEvent: ((event: string, data: unknown) => void) | undefined;
}

export {};
