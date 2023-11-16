import { SkyConfigFile, actorFromStately } from '@statelyai/sky';
import { useSelector } from '@xstate/react';
import { useEffect, useRef } from 'react';
import { Actor, AnyStateMachine, createActor, fromPromise } from 'xstate';

export function useStatelyActor<T extends AnyStateMachine>(
  options: Parameters<typeof actorFromStately>[0],
  skyConfig?: SkyConfigFile<T>,
) {
  if (!skyConfig) {
    throw new Error(
      `You need to run xstate sky "src/**/*.ts?(x)" before you can use the Stately Sky actor with url ${options.url}`,
    );
  }

  const actor = useRef<Actor<T>>();
  const state = useSelector(
    actor.current ?? createActor(skyConfig.machine),
    (snapshot) => snapshot,
  );

  useEffect(() => {
    const subscription = createActor(
      fromPromise(() => actorFromStately(options, skyConfig)),
    )
      .start()
      .subscribe((s) => {
        actor.current = s.output;
        actor.current?.start();
      });
    return () => {
      actor.current?.stop();
      return subscription.unsubscribe();
    };
  }, [options.url, options.sessionId, skyConfig]);

  const send = actor.current?.send;
  const isConnecting = send === undefined;

  const sky = { isConnecting };
  return [state, send, actor.current, sky] as const;
}
