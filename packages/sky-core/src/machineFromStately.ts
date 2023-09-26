import { AnyStateMachine } from 'xstate';
import { SkyConfigFile } from './types';

export function machineFromStately<T extends AnyStateMachine>(
  {
    apiKey,
    url,
  }: {
    apiKey?: string;
    url: string;
  },
  skyConfig?: SkyConfigFile<T>,
) {
  if (!skyConfig) {
    throw new Error(
      `You need to run xstate sky "src/**/*.ts?(x)" before you can use the Stately Sky actor with url ${url}`,
    );
  }
  return skyConfig.machine;
}
