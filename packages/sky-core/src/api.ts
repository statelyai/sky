import { InspectionEvent } from 'xstate';
import { hasStringError, skyConnectionInfo } from './utils';

export type Version = '1.0';
export type Endpoint =
  | {
      method: 'get-room-id';
      body: {};
      data: { skyRoomId: string };
    }
  | {
      method: 'save-event';
      body: InspectionEvent & { sessionId: string };
      data: { eventId: string };
    }
  | {
      method: 'get-events';
      body: { sessionId: string };
      data: { events: InspectionEvent[] };
    };

type EndpointBody = {
  [E in Endpoint as E['method']]: E['body'];
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
  body: EndpointBody[E],
  apiUrl?: string,
) {
  const { apiBaseURL } = apiUrl ? { apiBaseURL: apiUrl } : skyConnectionInfo();
  const skyVersion: Version = '1.0';
  const url = `${apiBaseURL}/${skyVersion}/${endpoint}`;
  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
    // TODO: should we use superjson here?
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
