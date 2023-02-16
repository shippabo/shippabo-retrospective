import { Prisma, Activity } from '@prisma/client';
import { prisma } from '../prisma/client';

export interface ActivityRepository {
  findActivities(where: Prisma.ActivityWhereInput): Promise<Activity[]>;
  createActivity(data: Prisma.ActivityCreateInput): Promise<Activity>;
}

export const createActivityRepository = (): ActivityRepository => {
  const findActivities = (where: Prisma.ActivityWhereInput) => prisma.activity.findMany({ where });

  const createActivity = (data: Prisma.ActivityCreateInput) => prisma.activity.create({ data });

  return {
    findActivities,
    createActivity,
  };
};
