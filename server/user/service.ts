import { Prisma, User } from '@prisma/client';
import { NotFoundError, ValidationError } from '../core/errors';
import { CreateUserInput } from './model';
import { UserRepository } from './repository';

export interface UserService {
  findUser(id: number): Promise<User>;
  findUsersBySession(sessionId: number): Promise<User[]>;
  createUser(input: CreateUserInput): Promise<User>;
  updateUser(id: number, input: Prisma.UserUpdateInput): Promise<User>;
}

export const createUserService = ({
  userRepository,
}: {
  userRepository: UserRepository;
}): UserService => {
  const findUser = async (id: number) => {
    const user = await userRepository.findUser(id);

    if (!user) {
      throw new NotFoundError('User does not exist');
    }

    return user;
  };

  const findUsersBySession = async (sessionId: number) => {
    const users = await userRepository.findUsers({ sessionId });

    return users.sort((a, b) => a.order - b.order);
  };

  const createUser = async (input: CreateUserInput) => {
    if (!input.name) {
      throw new ValidationError('User name is required');
    }

    if (!input.sessionId) {
      throw new ValidationError('Session is required');
    }

    return userRepository.createUser({
      name: input.name,
      isHost: input.isHost,
      order: input.order,
      session: {
        connect: {
          id: input.sessionId,
        },
      },
    });
  };

  const updateUser = async (id: number, input: Partial<User>) => {
    const user = await userRepository.findUser(id);

    if (!user) {
      throw new NotFoundError('User does not exist');
    }

    return userRepository.updateUser(user.id, input);
  };

  return {
    findUser,
    findUsersBySession,
    createUser,
    updateUser,
  };
};
