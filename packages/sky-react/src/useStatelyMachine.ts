import { SkyConfigFile, connectMachine } from '@statelyai/sky';
import { useSelector } from '@xstate/react';
import { useEffect, useState } from 'react';
import {
  Actor,
  AnyStateMachine,
  EventFromLogic,
  SnapshotFrom,
  createActor,
  fromPromise,
} from 'xstate';

export function useStatelyMachine<T extends AnyStateMachine>(
  options: Parameters<typeof connectMachine>[0],
  skyConfig: SkyConfigFile<T>,
): readonly [
  SnapshotFrom<T>,
  ((event: EventFromLogic<T>) => void) | undefined,
  Actor<T> | undefined,
  { isConnecting: boolean },
] {
  const [maybeActor, setMaybeActor] = useState<Actor<T>>();
  const state = useSelector(
    maybeActor ?? createActor(skyConfig.machine as never),
    (snapshot) => snapshot,
  );

  useEffect(() => {
    const subscription = createActor(
      fromPromise(() => connectMachine(options, skyConfig)),
    )
      .start()
      .subscribe(({ output }) => setMaybeActor(output));
    return () => {
      return subscription.unsubscribe();
    };
  }, [options.sessionId, skyConfig]);

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
