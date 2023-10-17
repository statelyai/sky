import PartySocket from 'partysocket';
import superjson from 'superjson';
import { SKY_API_URL, SKY_HOST } from './env';
import { SkyClientEvent } from './types';

import { Event, EventTarget } from 'event-target-shim';

if (!globalThis.Event) {
  globalThis.Event = Event;
}

if (!globalThis.EventTarget) {
  globalThis.EventTarget = EventTarget;
}

export const sendToSky = (socket: PartySocket, event: SkyClientEvent) => {
  socket.send(superjson.stringify(event));
};

// TODO: test that this works in a Node based environment
export function skyConnectionInfo() {
  return { host: SKY_HOST, apiBaseURL: SKY_API_URL };
}
