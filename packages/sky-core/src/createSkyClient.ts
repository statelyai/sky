import PartySocket from 'partysocket';
import superjson from 'superjson';
import {
  AnyActor,
  AnyActorLogic,
  createActor,
  EventFromLogic,
  SnapshotFrom,
  Subscription,
} from 'xstate';
import { callSky } from './api';
import { SkyServerEvent } from './types';
import { sendToSky, skyConnectionInfo } from './utils';

export type SkyClient<TLogic extends AnyActorLogic> = {
  inspect: any;
  sync: any;
  actor: (sessionId: string, logic: TLogic) => Promise<any>;
  snapshot: (sessionId: string, snapshot: SnapshotFrom<TLogic>) => Promise<any>;
  subscribeTo(
    sessionId: string,
    nextListener?: (snapshot: SnapshotFrom<TLogic>) => void,
  ): Subscription;
};

export function createSkyClient<TLogic extends AnyActorLogic>({
  apiKey,
  sessionId,
}: {
  apiKey: string;
  sessionId?: string;
}): SkyClient<TLogic> {
  // TODO: Should we use this actor to coordinate the Sky client?
  let actor: AnyActor | undefined;
  let partySocket: PartySocket | undefined;

  // Get the host for Partykit and the API base URL for Stately Studio
  const { host, apiBaseURL } = skyConnectionInfo();
  callSky('get-room-id', apiKey).then(({ roomId }) => {
    console.log('Ready, we now have a room ID:', roomId);
  });

  const skyClient: SkyClient<TLogic> = {
    inspect: host,
    sync: apiBaseURL,
    actor: async (sessionId, logic) => {
      console.log('actor', sessionId, logic);
    },
    snapshot: async (sessionId, snapshot) => {
      console.log('snapshot', sessionId, snapshot);
    },
    subscribeTo: (sessionId, nextListener) => {
      console.log('subscribeTo', sessionId, nextListener);
      return { unsubscribe: () => {} };
    },
  };

  if (partySocket && partySocket.OPEN) {
    partySocket.close();
  }

  let connectToSky = false;
  if (connectToSky) {
    const actorId = 'actorId';

    // Create a unique room for this actor run
    const room = `${actorId}-${sessionId}`;
    partySocket = new PartySocket({ host, room });
    partySocket.onerror = (err) => console.error(err);
    partySocket.onopen = () => {
      if (!partySocket) return;
      sendToSky(partySocket, {
        apiKey,
        type: 'actor.init',
        apiBaseURL,
        actorId,
        sessionId,
      });
    };

    partySocket.onmessage = (evt) => {
      const skyEvent = superjson.parse<SkyServerEvent>(evt.data);
      if (skyEvent.apiKey !== apiKey) return;
      switch (skyEvent.type) {
        case 'actor.error': {
          throw new Error(skyEvent.error);
        }
        case 'actor.start': {
          // Start the actor with the initial value from Sky
          actor = createActor({} as never, {
            snapshot: skyEvent.snapshot,
            input: {} as any,
          });

          // Send all events from the actor to Sky except for events that originate from Sky
          const originalSend = actor.send;
          actor.send = function (
            event: EventFromLogic<TLogic> & { sendToSky?: boolean },
          ) {
            // Send the event to the actor
            originalSend.call(this, event);

            // Don't start an infinite loop by sending events back to Sky
            if (event.sendToSky === false || !partySocket) return;

            sendToSky(partySocket, {
              apiKey,
              type: 'actor.send',
              event,
            });
          };
          // Close the socket when the actor stops
          actor.subscribe({ complete: () => partySocket?.close() });
          break;
        }
        case 'actor.send': {
          // When we receive an event from Sky, we don't want to send it back - we only want to send it to the local actor
          actor?.send({
            ...skyEvent.event,
            sendToSky: false,
          } as EventFromLogic<TLogic>);
          break;
        }
        case 'actor.stop': {
          actor?.stop();
          break;
        }
      }
    };
  }

  return skyClient;
}
