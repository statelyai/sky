import { SkyConfigFile, actorFromStately } from '@statelyai/sky';
import { useSelector } from '@xstate/react';
import { useEffect, useState } from 'react';
import { Actor, AnyStateMachine, createActor, fromPromise } from 'xstate';

export function useStatelyActor<T extends AnyStateMachine>(
  {
    apiKey,
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

  const [maybeActor, setMaybeActor] = useState<Actor<T>>();
  const state = useSelector(
    maybeActor ?? createActor(skyConfig.machine),
    (snapshot) => snapshot,
  );

  useEffect(() => {
    const subscription = createActor(
      fromPromise(() =>
        actorFromStately(
          {
            url,
            apiKey,
            sessionId,
            runOnSky,
          },
          skyConfig,
        ),
      ),
    )
      .start()
      .subscribe((s) => {
        s.output?.start();
        return setMaybeActor(s.output);
      });
    return () => subscription.unsubscribe();
  }, [apiKey, runOnSky, sessionId, skyConfig, url]);

  return [state, maybeActor?.send, maybeActor] as const;
}
