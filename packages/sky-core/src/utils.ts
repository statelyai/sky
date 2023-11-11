import PartySocket from 'partysocket';
import superjson from 'superjson';
import { SkyClientEvent } from './types';

export const sendToSky = (socket: PartySocket, event: SkyClientEvent) => {
  socket.send(superjson.stringify(event));
};

let SKY_HOST = 'stately-sky-beta.mellson.partykit.dev';
let SKY_API_URL = 'https://stately.ai/registry/api/sky';

// TODO: test that this works in a Node based environment
export function skyConnectionInfo() {
  return { host: SKY_HOST, apiBaseURL: SKY_API_URL };
}
