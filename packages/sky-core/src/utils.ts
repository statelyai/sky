import PartySocket from 'partysocket';
import superjson from 'superjson';
import { SKY_API_URL, SKY_HOST } from './env';
import { SkyClientEvent } from './types';

export const sendToSky = (socket: PartySocket, event: SkyClientEvent) => {
  socket.send(superjson.stringify(event));
};

export function skyConnectionInfo() {
  return { host: SKY_HOST, apiBaseURL: SKY_API_URL };
}

export const hasStringError = (
  error: unknown,
): error is {
  error: string;
} =>
  typeof error === 'object' &&
  error !== null &&
  'error' in error &&
  typeof (error as Record<string, unknown>).error === 'string';
