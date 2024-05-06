import PartySocket from 'partysocket';
import superjson from 'superjson';
import {
  Actor,
  AnyActor,
  AnyStateMachine,
  EventFromLogic,
  createActor,
} from 'xstate';
import { SkyConfigFile, SkyServerEvent } from './types';
import { sendToSky, skyConnectionInfo } from './utils';

export async function actorFromStately<T extends AnyStateMachine>(
  {
    apiKey,
    url,
    sessionId,
    onPlayerJoined,
    onPlayerLeft,
    input,
  }: {
    apiKey: string;
    url: string;
    sessionId: string;
    onPlayerJoined?: ({ numberOfPlayers }: { numberOfPlayers: number }) => void;
    onPlayerLeft?: ({ numberOfPlayers }: { numberOfPlayers: number }) => void;
    input?: unknown;
  },
  skyConfig?: SkyConfigFile<T>,
): Promise<Actor<T>> {
  if (!skyConfig) {
    throw new Error(
      `You need to run xstate sky "src/**/*.ts?(x)" before you can use the Stately Sky actor with url ${url}`,
    );
  }

  let actor: AnyActor | undefined;
  let partySocket: PartySocket | undefined;

  // Get the host for Partykit and the API base URL for Stately Studio
  const { host, apiBaseURL } = skyConnectionInfo();
  const { actorId, machine } = skyConfig;

  return new Promise<Actor<T>>((resolve, reject) => {
    // Close the previous socket if it exists, this can easily happen when using React
    if (partySocket && partySocket.OPEN) {
      partySocket.close();
    }
    // Create a unique room for this actor run
    const room = `${actorId}-${sessionId}`;
    partySocket = new PartySocket({ host, room });
    partySocket.onerror = (err) => reject(err);
    partySocket.onopen = () => {
      if (!partySocket) return;
      return sendToSky(partySocket, {
        apiKey,
        type: 'actor.init',
        apiBaseURL,
        actorId,
        sessionId,
      });
    };

    // TODO: test what happens on reconnect
    // TODO: handle eventual consistency if users manage to get into different states
    partySocket.onmessage = (evt) => {
      const skyEvent = superjson.parse<SkyServerEvent>(evt.data);
      if (skyEvent.apiKey !== apiKey) return;
      switch (skyEvent.type) {
        case 'player.joined': {
          onPlayerJoined?.({ numberOfPlayers: skyEvent.numberOfPlayers });
          break;
        }
        case 'player.left': {
          onPlayerLeft?.({ numberOfPlayers: skyEvent.numberOfPlayers });
          break;
        }
        case 'actor.error': {
          throw new Error(skyEvent.error);
        }
        case 'actor.start': {
          // Start the actor with the initial value from Sky
          actor = createActor(machine as never, {
            snapshot: skyEvent.snapshot,
            input: input as any,
          });

          // Send all events from the actor to Sky except for events that originate from Sky
          const originalSend = actor.send;
          actor.send = function (
            event: EventFromLogic<T> & { sendToSky?: boolean },
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
          resolve(actor);
          break;
        }
        case 'actor.send': {
          // When we receive an event from Sky, we don't want to send it back - we only want to send it to the local actor
          actor?.send({
            ...skyEvent.event,
            sendToSky: false,
          } as EventFromLogic<T>);
          break;
        }
        case 'actor.stop': {
          actor?.stop();
          break;
        }
      }
    };
  });
}
