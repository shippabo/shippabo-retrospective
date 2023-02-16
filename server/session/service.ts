import { User, Session } from '@prisma/client';
import { NotFoundError, ValidationError } from '../core/errors';
import { UserService } from '../user/service';
import { CreateSessionInput, JoinSessionInput } from './model';
import { SessionRepository } from './repository';

export interface SessionService {
  findSession(id: number): Promise<Session>;
  findSessionUsers(id: number): Promise<User[]>;
  createSession(input: CreateSessionInput): Promise<Session>;
  startSession(id: number): Promise<Session>;
  joinSession(input: JoinSessionInput): Promise<Session>;
  stopSession(id: number): Promise<Session>;
}

export const createSessionService = ({
  sessionRepository,
  userService,
}: {
  sessionRepository: SessionRepository;
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

    await userService.createUser({
      name: input.userName,
      sessionId: session.id,
      isHost: true,
      order: 1,
    });

    return session;
  };

  const startSession = async (id: number) => {
    const session = await sessionRepository.updateSession(id, {
      startedAt: new Date(),
    });

    if (!session) {
      throw new NotFoundError('Session does not exist');
    }

    const users = await userService.findUsersBySession(session.id);

    const randomize = users
      .map((user) => ({ user, seed: Math.random() }))
      .sort((a, b) => a.seed - b.seed)
      .map(({ user }, index) => ({ user, order: index + 1 }));

    for (const { user, order } of randomize) {
      await userService.updateUser(user.id, { order });
    }

    return session;
  };

  const joinSession = async (input: JoinSessionInput) => {
    const { sessionId, userName } = input;

    const session = await sessionRepository.findSession(sessionId);

    if (!session) {
      throw new NotFoundError('Session does not exist');
    }

    const users = await userService.findUsersBySession(sessionId);

    await userService.createUser({
      sessionId,
      name: userName,
      isHost: false,
      order: users.length + 1,
    });

    return session;
  };

  const stopSession = async (id: number) => {
    const session = await sessionRepository.updateSession(id, {
      stoppedAt: new Date(),
    });

    if (!session) {
      throw new NotFoundError('Session does not exist');
    }

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
