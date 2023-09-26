import { AnyStateMachine } from 'xstate';

export interface SkyConfig {
  config: any;
  actor: { id: string };
  prettyConfigString: string;
}

export interface SkyConfigFile<T extends AnyStateMachine> {
  machine: T;
  actorId: string;
}

import {
  AnyActorLogic,
  AnyEventObject,
  PersistedStateFrom,
  StateValue,
} from 'xstate';

interface SafeSkyEvent {
  apiKey: string;
}

type InternalSkyClientSimulateEvent =
  | {
      type: 'simulation.init';
      apiBaseURL: string;
      machineId: string;
      value?: StateValue;
    }
  | { type: 'simulation.stop' }
  | { type: 'simulation.update' | 'simulation.reset'; value: StateValue };

export type SkyClientSimulateEvent = SafeSkyEvent &
  InternalSkyClientSimulateEvent;

type InternalSkyClientActorEvent =
  | {
      type: 'actor.init';
      apiBaseURL: string;
      actorId: string;
      sessionId?: string;
    }
  | { type: 'actor.send'; event: AnyEventObject };

export type SkyClientActorEvent = SafeSkyEvent & InternalSkyClientActorEvent;

export type SkyClientEvent = SkyClientSimulateEvent | SkyClientActorEvent;

type InternalSkyServerSimulateEvent =
  | { type: 'simulation.start'; value?: StateValue }
  | { type: 'simulation.update' | 'simulation.reset'; value: StateValue }
  | { type: 'simulation.stop' };

export type SkyServerSimulateEvent = SafeSkyEvent &
  InternalSkyServerSimulateEvent;

type InternalSkyServerActorEvent =
  | { type: 'actor.start'; persistedState: PersistedStateFrom<AnyActorLogic> }
  | { type: 'actor.send'; event: AnyEventObject }
  | { type: 'actor.stop'; event: AnyEventObject }
  | { type: 'actor.error'; error: string };

export type SkyServerActorEvent = SafeSkyEvent & InternalSkyServerActorEvent;

export type SkyServerEvent = SkyServerSimulateEvent | SkyServerActorEvent;
