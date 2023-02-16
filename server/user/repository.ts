import { Prisma, User } from '@prisma/client';
import { prisma } from '../prisma/client';

export interface UserRepository {
  findUser(id: number): Promise<User | null>;
  findUsers(where: Prisma.UserWhereInput): Promise<User[]>;
  createUser(data: Prisma.UserCreateInput): Promise<User>;
  updateUser(id: number, data: Prisma.UserUpdateInput): Promise<User>;
}

export const createUserRepository = (): UserRepository => {
  const findUser = (id: number) => prisma.user.findFirst({ where: { id } });

  const findUsers = (where: Prisma.UserWhereInput) => prisma.user.findMany({ where });

  const createUser = (data: Prisma.UserCreateInput) => prisma.user.create({ data });

  const updateUser = (id: number, data: Prisma.UserUpdateInput) =>
    prisma.user.update({ where: { id }, data });

  return {
    findUser,
    findUsers,
    createUser,
    updateUser,
  };
};
