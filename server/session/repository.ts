import { Prisma, Session } from '@prisma/client';
import { prisma } from '../prisma/client';

export interface SessionRepository {
  findSession(id: number): Promise<Session | null>;
  createSession(data: Prisma.SessionCreateInput): Promise<Session>;
  updateSession(id: number, data: Prisma.SessionUpdateInput): Promise<Session>;
}

export const createSessionRepository = (): SessionRepository => {
  const findSession = (id: number) => prisma.session.findFirst({ where: { id } });

  const createSession = (data: Prisma.SessionCreateInput) => prisma.session.create({ data });

  const updateSession = (id: number, data: Prisma.SessionUpdateInput) =>
    prisma.session.update({ where: { id }, data });

  return {
    findSession,
    createSession,
    updateSession,
  };
};
