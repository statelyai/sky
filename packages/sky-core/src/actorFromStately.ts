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

let actor: AnyActor | undefined;
export async function actorFromStately<T extends AnyStateMachine>(
  {
    apiKey: _apiKey,
    url,
    sessionId,
    runOnSky = true,
  }: {
    apiKey?: string;
    url: string;
    sessionId?: string;
    runOnSky?: boolean;
  },
  skyConfig?: SkyConfigFile<T>,
) {
  if (!skyConfig) {
    throw new Error(
      `You need to run xstate sky "src/**/*.ts?(x)" before you can use the Stately Sky actor with url ${url}`,
    );
  }
  if (!runOnSky) {
    return createActor(skyConfig.machine);
  } else {
    // Get the host for Partykit and the API base URL for Stately Studio
    const { host, apiBaseURL } = skyConnectionInfo();
    const { actorId, machine } = skyConfig;
    const apiKey =
      _apiKey ??
      process.env.STATELY_SKY_API_KEY ??
      process.env.NEXT_PUBLIC_STATELY_SKY_API_KEY;

    if (!apiKey) {
      throw new Error(
        `You need to provide an API key to use the Stately Sky actor with url ${url}`,
      );
    }

    return new Promise<Actor<T>>((resolve, reject) => {
      // Create a unique room for this actor run
      const room = sessionId ? `${actorId}-${sessionId}` : actorId;
      const partySocket = new PartySocket({ host, room });
      partySocket.onerror = (err) => reject(err);
      partySocket.onopen = () => {
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
          case 'actor.error': {
            throw new Error(skyEvent.error);
          }
          case 'actor.start': {
            // Start the actor with the initial value from Sky
            actor = createActor(machine, {
              state: skyEvent.persistedState,
            }).start();

            // Send all events from the actor to Sky except for events that originate from Sky
            const originalSend = actor.send;
            actor.send = function (
              event: EventFromLogic<T> & { sendToSky?: boolean },
            ) {
              // Send the event to the actor
              originalSend.call(this, event);

              // Don't start an infinite loop by sending events back to Sky
              if (event.sendToSky === false) return;

              sendToSky(partySocket, {
                apiKey,
                type: 'actor.send',
                event,
              });
            };
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
}