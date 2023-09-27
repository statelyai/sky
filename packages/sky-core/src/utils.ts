import PartySocket from 'partysocket';
import superjson from 'superjson';
import { SKY_API_URL, SKY_HOST } from './env';
import { SkyClientEvent } from './types';

export const sendToSky = (socket: PartySocket, event: SkyClientEvent) => {
  socket.send(superjson.stringify(event));
};

export function skyConnectionInfo() {
  // TODO: test that this works in a Node based environment
  return {
    host: SKY_HOST ?? 'stately-sky-beta.mellson.partykit.dev',
    apiBaseURL: SKY_API_URL ?? 'https://stately.ai/registry/api/sky',
  };
}
