import PartySocket from 'partysocket';
import superjson from 'superjson';
import {
  AnyActorLogic,
  InspectionEvent,
  SnapshotFrom,
  Subscription,
} from 'xstate';
import { callSky } from './api';
import { SkyServerEvent } from './types';
import { sendToSky, skyConnectionInfo } from './utils';

export type SkyClient<TLogic extends AnyActorLogic> = {
  inspect: (inspectionEvent: InspectionEvent) => void;
  sync: unknown;
  actor: (sessionId: string, logic: TLogic) => Promise<any>;
  snapshot: (sessionId: string, snapshot: SnapshotFrom<TLogic>) => Promise<any>;
  subscribeTo?(
    sessionId: string,
    nextListener?: (snapshot: SnapshotFrom<TLogic>) => void,
  ): Subscription;

  // TODO: Not sure we need this, it's just here for convenience during development
  inspectListener?: (event: InspectionEvent) => void;

  // TODO: move this to a options object
  fullReplay?: boolean;
};

// We have this global map to ensure that we don't create duplicate clients across potential re-renders
const existingClients: Map<string, SkyClient<any>> = new Map();

export function createSkyClient<TLogic extends AnyActorLogic>({
  apiKey,
  sessionId,
}: {
  apiKey: string;
  sessionId: string;
}): SkyClient<TLogic> {
  if (existingClients.has(apiKey + sessionId)) {
    return existingClients.get(apiKey + sessionId) as SkyClient<TLogic>;
  }

  let currentSocket: PartySocket | undefined;
  if (currentSocket && currentSocket.OPEN) {
    console.log('Closing previous PartySocket');
    currentSocket.close();
  }

  let offlineEvents: InspectionEvent[] = [];
  const inspect = (event: InspectionEvent) => {
    switch (event.type) {
      case '@xstate.snapshot':
      case '@xstate.event':
      case '@xstate.actor': {
        if (currentSocket) {
          sendToSky(currentSocket, {
            apiKey,
            type: 'sky.inspection.event',
            event,
          });
        } else {
          offlineEvents.push(event);
        }
        return event;
      }
    }
  };

  const skyClient: SkyClient<TLogic> = {
    inspect,
    sync: () => {
      console.log('this sync function is not implemented yet');
    },
    actor: async (sessionId, logic) => {
      console.log('actor', sessionId, logic);
    },
    snapshot: async (sessionId, snapshot) => {
      console.log('snapshot', sessionId, snapshot);
    },
    subscribeTo: (sessionId, nextListener) => {
      return { unsubscribe: () => {} };
    },
  };

  callSky('get-room-id', apiKey, {}).then(({ skyRoomId }) => {
    const room = `${skyRoomId}-${sessionId}`;
    console.log(`Connected to Sky room: ${room}`);

    const { apiBaseURL, host } = skyConnectionInfo();
    currentSocket = new PartySocket({ host, room });

    currentSocket.onerror = (err) => console.error(err);

    currentSocket.onopen = () => {
      if (!currentSocket) return;
      sendToSky(currentSocket, {
        apiBaseURL,
        apiKey,
        sessionId,
        type: 'sky.client.connect',
      });
    };

    currentSocket.onclose = () => {
      console.log('PartySocket closed');
    };

    currentSocket.onmessage = (evt) => {
      const skyEvent = superjson.parse<SkyServerEvent>(evt.data);
      if (skyEvent.apiKey !== apiKey) return;
      switch (skyEvent.type) {
        case 'sky.client.connected': {
          if (offlineEvents.length > 0) {
            offlineEvents.forEach(inspect);
            offlineEvents = [];
          }
          if (skyClient.inspectListener) {
            callSky('get-events', apiKey, { sessionId }).then(({ events }) => {
              if (skyClient.inspectListener) {
                events.forEach(skyClient.inspectListener);
              }
            });
          }
          break;
        }
        case 'sky.inspection.event': {
          skyClient.inspectListener?.(skyEvent.event);
          break;
        }
      }
    };
  });

  existingClients.set(apiKey + sessionId, skyClient);
  return skyClient;
}
