import { hasStringError, skyConnectionInfo } from './utils';

export type Version = '1.0';
export type Endpoint =
  | {
      method: 'get-room-id';
      data: { skyRoomId: string };
    }
  | {
      method: 'some-other-endpoint';
      data: { someData: string };
    };

type EndpointData = {
  [E in Endpoint as E['method']]: E['data'];
};

// This is the type we consume in the Studio SKY API to ensure we return the correct data or an error message
export type EndpointHandler<E extends Endpoint['method']> =
  | EndpointData[E]
  | { error: string };

export async function callSky<E extends Endpoint['method']>(
  endpoint: E,
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
      if (hasStringError(data)) {
        console.error(data.error);
        throw new Error(data.error);
      } else {
        throw new Error('An unknown error occurred');
      }
    }
    return data as EndpointData[E];
  } catch (error) {
    throw error;
  }
}
