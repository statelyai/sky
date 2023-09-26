import { SkyConfigFile, actorFromStately } from '@statelyai/sky';
import { useSelector } from '@xstate/react';
import { useEffect, useState } from 'react';
import {
  Actor,
  AnyStateMachine,
  createActor,
  createEmptyActor,
  fromPromise,
} from 'xstate';

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
  const [maybeActor, setMaybeActor] = useState<Actor<T>>();
  const state = useSelector(maybeActor ?? createEmptyActor(), (s) => s);

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
      .subscribe((s) => setMaybeActor(s.output));
    return () => subscription.unsubscribe();
  }, []);

  return [state, maybeActor?.send, maybeActor] as const;
}
