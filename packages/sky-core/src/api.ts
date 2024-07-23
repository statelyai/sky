import { isErrorWithMessage, skyConnectionInfo } from './utils';

export type Version = '1.0';
export type Endpoint =
  | {
      method: 'get-room-id';
      data: { roomId: string };
    }
  | {
      method: 'some-other-endpoint';
      data: { someData: string };
    };

export type SkyApiType = {
  [E in Endpoint as E['method']]: E['data'];
};

export async function callSky<M extends Endpoint['method']>(
  endpoint: M,
  apiKey: string,
  body?: any,
) {
  const { apiBaseURL } = skyConnectionInfo();
  const apiVersion: Version = '1.0';
  const url = `${apiBaseURL}/${apiVersion}/${endpoint}`;
  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await response.json();
    if (!response.ok) {
      if (isErrorWithMessage(data)) {
        console.error(data.message);
        throw new Error(data.message);
      } else {
        throw new Error('An unknown error occurred');
      }
    }
    return data as SkyApiType[typeof endpoint];
  } catch (error) {
    throw error;
  }
}
