import PartySocket from 'partysocket';
import superjson from 'superjson';
import { SkyClientEvent } from './types';

export const sendToSky = (socket: PartySocket, event: SkyClientEvent) => {
  socket.send(superjson.stringify(event));
};

export function skyConnectionInfo() {
  return {
    host:
      process.env.NEXT_PUBLIC_SKY_HOST ??
      'stately-sky-beta.mellson.partykit.dev',
    apiBaseURL:
      process.env.NEXT_PUBLIC_SKY_API_URL ??
      'https://stately.ai/registry/api/sky',
  };
}
