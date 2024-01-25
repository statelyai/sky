import { createInspector as inspectCreator } from '@statelyai/inspect';
import PartySocket from 'partysocket';
import { v4 as uuidv4 } from 'uuid';
import { isNode, sendToSky, skyConnectionInfo } from './utils';

export function createInspector(options: {
  apiKey: string;
  onerror?: (error: Error) => void;
}): ReturnType<typeof inspectCreator> {
  const { host, apiBaseURL } = skyConnectionInfo();
  const server = apiBaseURL.replace('/api/sky', '');
  const apiKey = options.apiKey;
  const sessionId = uuidv4(); // Generate a unique ID
  const room = `inspect-${sessionId}`;
  const partySocket = new PartySocket({
    host,
    room,
    WebSocket: isNode ? require('ws') : undefined,
  });
  partySocket.onerror = options.onerror ?? console.error;
  partySocket.onopen = () => {
    console.log('Connected to Sky, open your live inspect session:');
    console.log(`${server}/inspect/${sessionId}`);
  };
  return inspectCreator({
    send(event) {
      sendToSky(partySocket, {
        apiKey,
        ...event,
      });
    },
  });
}
