import { SkyConfigFile, actorFromStately } from '@statelyai/sky';
import { useSelector } from '@xstate/react';
import { useEffect, useState } from 'react';
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

  const [maybeActor, setMaybeActor] = useState<Actor<T>>();
  const state = useSelector(
    maybeActor ?? createActor(skyConfig.machine as any),
    (snapshot) => snapshot,
  );

  useEffect(() => {
    const subscription = createActor(
      fromPromise(() => actorFromStately(options, skyConfig)),
    )
      .start()
      .subscribe(({ output }) => setMaybeActor(output));
    return () => {
      return subscription.unsubscribe();
    };
  }, [options.url, options.sessionId, skyConfig]);

  useEffect(() => {
    maybeActor?.start();
    return () => {
      maybeActor?.stop();
    };
  }, [maybeActor]);

  const send = maybeActor?.send;
  const isConnecting = send === undefined;

  const sky = { isConnecting };
  return [state, send, maybeActor, sky] as const;
}
