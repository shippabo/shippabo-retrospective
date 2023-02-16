import type { components as SchemaComponents, paths as SchemaPath } from './schema';

type HttpStatus = 200 | 404 | 422;

const host = {
  server: 'http://localhost:5001',
  websocket: 'ws://localhost:5001',
};

export type User = SchemaComponents['schemas']['User'];

export type Session = SchemaComponents['schemas']['Session'];

export type Activity = SchemaComponents['schemas']['Activity'];

function isValidHttpStatus(status: number): status is HttpStatus {
  return [200, 404, 422].includes(status);
}

type ContentType = {
  content: {
    'application/json': unknown;
  };
};

type GetParametersType = {
  get: {
    parameters: {
      path: object;
    };
  };
};

type GetResponseType = {
  get: {
    responses: {
      [status in HttpStatus]: ContentType;
    };
  };
};

type PostParametersType = {
  post: {
    parameters: {
      path: object;
    };
  };
};

type PostResponseType = {
  post: {
    responses: {
      [status in HttpStatus]: ContentType;
    };
  };
};

type PostRequestType = {
  post: {
    requestBody: ContentType;
  };
};

type FetchParams<URL extends keyof SchemaPath> = SchemaPath[URL] extends GetParametersType
  ? SchemaPath[URL]['get']['parameters']['path']
  : SchemaPath[URL] extends PostParametersType
  ? SchemaPath[URL]['post']['parameters']['path']
  : never;

type FetchRequest<URL extends keyof SchemaPath> = SchemaPath[URL] extends PostRequestType
  ? SchemaPath[URL]['post']['requestBody']['content']['application/json']
  : never;

type FetchResult<
  URL extends keyof SchemaPath,
  Status extends HttpStatus,
> = SchemaPath[URL] extends GetResponseType
  ? SchemaPath[URL]['get']['responses'][Status]['content']['application/json']
  : SchemaPath[URL] extends PostResponseType
  ? SchemaPath[URL]['post']['responses'][Status]['content']['application/json']
  : never;

type FetchResponse<URL extends keyof SchemaPath> =
  | {
      status: 200;
      data: FetchResult<URL, 200>;
    }
  | {
      status: 404;
      data: FetchResult<URL, 404>;
    }
  | {
      status: 422;
      data: FetchResult<URL, 422>;
    };

async function get<URL extends keyof SchemaPath>(
  _url: URL,
  request: SchemaPath[URL] extends GetParametersType ? { params: FetchParams<URL> } : undefined,
): Promise<FetchResponse<URL>> {
  let url: string = _url;

  if (request?.params) {
    Object.entries(request?.params).forEach(([key, value]) => {
      url = url.replace(`{${key}}`, value.toString());
    });
  }

  const res = await fetch(`${host.server}${url}`, {
    method: 'get',
  });

  if (!isValidHttpStatus(res.status)) {
    throw new Error('Server error');
  }

  return { status: res.status, data: await res.json() };
}

async function post<URL extends keyof SchemaPath>(
  _url: URL,
  request: SchemaPath[URL] extends PostParametersType
    ? SchemaPath[URL] extends PostRequestType
      ? {
          params: FetchParams<URL>;
          payload: FetchRequest<URL>;
        }
      : {
          params: FetchParams<URL>;
        }
    : SchemaPath[URL] extends PostRequestType
    ? {
        payload: FetchRequest<URL>;
      }
    : never,
): Promise<FetchResponse<URL>> {
  let url: string = _url;

  if ('params' in request) {
    Object.entries(request.params).forEach(([key, value]) => {
      url = url.replace(`{${key}}`, value.toString());
    });
  }

  const res = await fetch(`${host.server}${url}`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: 'payload' in request ? JSON.stringify(request.payload) : undefined,
  });

  if (!isValidHttpStatus(res.status)) {
    throw new Error('Server error');
  }

  return { status: res.status, data: await res.json() };
}

export type WebsocketEvent = {
  SESSION: {
    type: 'SESSION';
    session: Session;
  };
  SESSION_USERS: {
    type: 'SESSION_USERS';
    sessionId: number;
    users: User[];
  };
  SESSION_ACTIVITIES: {
    type: 'SESSION_ACTIVITIES';
    sessionId: number;
    activities: Activity[];
  };
};

const websocket = new WebSocket(host.websocket);

let timeout: number;

function heartbeat() {
  clearTimeout(timeout);

  timeout = window.setTimeout(() => {
    websocket.close();
  }, 31000);
}

websocket.addEventListener('error', console.error);
websocket.addEventListener('open', heartbeat);
websocket.addEventListener('ping', heartbeat);
websocket.addEventListener('close', () => clearTimeout(timeout));

export type Unsubscribe = () => void;

function subscribe<Type extends keyof WebsocketEvent>(
  type: Type,
  listener: (data: WebsocketEvent[Type]) => void,
): Unsubscribe {
  const handler: (event: MessageEvent) => void = (event) => {
    const data: WebsocketEvent[Type] = JSON.parse(event.data);

    if (data.type === type) {
      listener(data);
    }
  };

  websocket.addEventListener('message', handler);

  return () => {
    websocket.removeEventListener('message', handler);
  };
}

const api = {
  get,
  post,
  subscribe,
};

export default api;
