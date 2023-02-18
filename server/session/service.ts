import { User, Session } from '@prisma/client';
import { ActivityService } from '../activity/service';
import { NotFoundError, ValidationError } from '../core/errors';
import { UserService } from '../user/service';
import { SessionEventType, SessionWebsocket } from './websocket';
import { CreateSessionInput, JoinSessionInput, StartSessionInput, StopSessionInput } from './model';
import { SessionRepository } from './repository';

export interface SessionService {
  findSession(id: number): Promise<Session>;
  findSessionUsers(id: number): Promise<User[]>;
  createSession(input: CreateSessionInput): Promise<Session>;
  startSession(input: StartSessionInput): Promise<Session>;
  joinSession(input: JoinSessionInput): Promise<User>;
  stopSession(input: StopSessionInput): Promise<Session>;
}

export const createSessionService = ({
  sessionWebsocket,
  sessionRepository,
  activityService,
  userService,
}: {
  sessionWebsocket: SessionWebsocket;
  sessionRepository: SessionRepository;
  activityService: ActivityService;
  userService: UserService;
}): SessionService => {
  const findSession = async (id: number) => {
    const session = await sessionRepository.findSession(id);

    if (!session) {
      throw new NotFoundError('Session does not exist');
    }

    return session;
  };

  const findSessionUsers = async (id: number) => {
    const session = await sessionRepository.findSession(id);

    if (!session) {
      throw new NotFoundError('Session does not exist');
    }

    return userService.findUsersBySession(session.id);
  };

  const createSession = async (input: CreateSessionInput) => {
    if (!input.sessionName) {
      throw new ValidationError('Session name is required');
    }

    if (!input.userName) {
      throw new ValidationError('User name is required');
    }

    const session = await sessionRepository.createSession({
      name: input.sessionName,
    });

    const user = await userService.createUser({
      name: input.userName,
      sessionId: session.id,
      isHost: true,
      order: 1,
    });

    await activityService.createActivity({
      event: `${user.name} created session ${session.name}.`,
      sessionId: session.id,
    });

    return session;
  };

  const startSession = async (input: StartSessionInput) => {
    const { sessionId, userId } = input;

    const session = await sessionRepository.updateSession(sessionId, {
      startedAt: new Date(),
    });

    if (!session) {
      throw new NotFoundError('Session does not exist');
    }

    const user = await userService.findUser(userId);

    const users = await userService.findUsersBySession(session.id);

    const randomize = users
      .map((user) => ({ user, seed: Math.random() }))
      .sort((a, b) => a.seed - b.seed)
      .map(({ user }, index) => ({ user, order: index + 1 }));

    for (const { user, order } of randomize) {
      await userService.updateUser(user.id, { order });
    }

    await activityService.createActivity({
      event: `${user.name} started the session.`,
      sessionId: session.id,
    });

    sessionWebsocket.publish(SessionEventType.SESSION, {
      type: SessionEventType.SESSION,
      session,
    });

    return session;
  };

  const joinSession = async (input: JoinSessionInput) => {
    const { sessionId, userName } = input;

    const session = await sessionRepository.findSession(sessionId);

    if (!session) {
      throw new NotFoundError('Session does not exist');
    }

    const users = await userService.findUsersBySession(sessionId);

    const user = await userService.createUser({
      sessionId,
      name: userName,
      isHost: false,
      order: users.length + 1,
    });

    await activityService.createActivity({
      event: `${user.name} joined session.`,
      sessionId: session.id,
    });

    sessionWebsocket.publish(SessionEventType.SESSION_USERS, {
      type: SessionEventType.SESSION_USERS,
      sessionId,
      users: [...users, user],
    });

    const activities = await activityService.findActivitiesBySession(sessionId);

    sessionWebsocket.publish(SessionEventType.SESSION_ACTIVITIES, {
      type: SessionEventType.SESSION_ACTIVITIES,
      sessionId,
      activities,
    });

    return user;
  };

  const stopSession = async (input: StopSessionInput) => {
    const { sessionId, userId } = input;

    const session = await sessionRepository.updateSession(sessionId, {
      stoppedAt: new Date(),
    });

    if (!session) {
      throw new NotFoundError('Session does not exist');
    }

    const user = await userService.findUser(userId);

    await activityService.createActivity({
      event: `${user.name} stopped the session.`,
      sessionId: session.id,
    });

    const activities = await activityService.findActivitiesBySession(sessionId);

    sessionWebsocket.publish(SessionEventType.SESSION_ACTIVITIES, {
      type: SessionEventType.SESSION_ACTIVITIES,
      sessionId,
      activities,
    });

    return session;
  };

  return {
    findSession,
    findSessionUsers,
    createSession,
    startSession,
    joinSession,
    stopSession,
  };
};
