import { EventEmitter } from 'events';
import { Server } from 'ws';
import { WebSocket } from 'ws';

import { Activity, Session, User } from '@prisma/client';

export enum SessionEventType {
  SESSION = 'SESSION',
  SESSION_USERS = 'SESSION_USERS',
  SESSION_ACTIVITIES = 'SESSION_ACTIVITIES',
}

export type SessionEvent = {
  [SessionEventType.SESSION]: {
    type: SessionEventType.SESSION;
    session: Session;
  };
  [SessionEventType.SESSION_USERS]: {
    type: SessionEventType.SESSION_USERS;
    sessionId: number;
    users: User[];
  };
  [SessionEventType.SESSION_ACTIVITIES]: {
    type: SessionEventType.SESSION_ACTIVITIES;
    sessionId: number;
    activities: Activity[];
  };
};

export interface SessionWebsocket {
  publish<EventType extends SessionEventType>(
    event: EventType,
    data: SessionEvent[EventType],
  ): void;
  subscribe<EventType extends SessionEventType>(
    event: EventType,
    listener: (data: SessionEvent[EventType]) => void,
  ): void;
}

export const createSessionWebsocket = ({
  websocketServer,
}: {
  websocketServer: Server;
}): SessionWebsocket => {
  const eventEmitter = new EventEmitter();

  function publish<EventType extends SessionEventType>(
    event: EventType,
    data: SessionEvent[EventType],
  ) {
    eventEmitter.emit(event, data);
  }

  function subscribe<EventType extends SessionEventType>(
    event: EventType,
    listener: (data: SessionEvent[EventType]) => void,
  ) {
    eventEmitter.on(event, listener);
  }

  Object.values(SessionEventType).forEach((event) => {
    subscribe(event, (payload) => {
      websocketServer.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(payload));
        }
      });
    });
  });

  return {
    publish,
    subscribe,
  };
};
