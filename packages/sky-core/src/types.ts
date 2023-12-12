import {
  AnyEventObject,
  AnyStateMachine,
  SnapshotFrom,
  StateValue,
} from 'xstate';

export type SkyConfig =
  | {
      config: any;
      actorId: string;
      configString: string;
      implementationString: string;
    }
  | { error: string };

export interface SkyConfigFile<T extends AnyStateMachine> {
  machine: T;
  actorId: string;
}

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

type InternalSkyClientActorEvent =
  | {
      type: 'actor.init';
      apiBaseURL: string;
      actorId: string;
      sessionId?: string;
    }
  | { type: 'actor.send'; event: AnyEventObject };

type InternalClientEditorEvent = { type: 'digraphEvent'; event: any };

export type SkyClientSimulateEvent = SafeSkyEvent &
  InternalSkyClientSimulateEvent;
export type SkyClientEditorEvent = SafeSkyEvent & InternalClientEditorEvent;

export type SkyClientActorEvent = SafeSkyEvent & InternalSkyClientActorEvent;

export type SkyClientEvent =
  | SkyClientSimulateEvent
  | SkyClientActorEvent
  | SkyClientEditorEvent;

type InternalSkyServerSimulateEvent =
  | { type: 'simulation.start'; value?: StateValue }
  | { type: 'simulation.update' | 'simulation.reset'; value: StateValue }
  | { type: 'simulation.stop' };

export type SkyServerSimulateEvent = SafeSkyEvent &
  InternalSkyServerSimulateEvent;

type InternalSkyServerActorEvent =
  | { type: 'actor.start'; persistedState: SnapshotFrom<AnyStateMachine> }
  | { type: 'actor.send'; event: AnyEventObject }
  | { type: 'actor.stop'; event: AnyEventObject }
  | { type: 'actor.error'; error: string };

type MultiplayerSkyEvent = {
  type: 'player.joined' | 'player.left';
  numberOfPlayers: number;
};

type InternalServerEditorEvent = { type: 'digraphEvent'; event: any };

export type SkyServerMultiplayerEvent = SafeSkyEvent & MultiplayerSkyEvent;

export type SkyServerActorEvent = SafeSkyEvent & InternalSkyServerActorEvent;

export type SkyServerEditorEvent = SafeSkyEvent & InternalServerEditorEvent;

export type SkyServerEvent =
  | SkyServerSimulateEvent
  | SkyServerActorEvent
  | SkyServerMultiplayerEvent
  | SkyServerEditorEvent;
