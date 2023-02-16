import { Activity } from '@prisma/client';
import { ValidationError } from '../core/errors';
import { CreateActivityInput } from './model';
import { ActivityRepository } from './repository';

export interface ActivityService {
  findActivitiesBySession(sessionId: number): Promise<Activity[]>;
  createActivity(input: CreateActivityInput): Promise<Activity>;
}

export const createActivityService = ({
  activityRepository,
}: {
  activityRepository: ActivityRepository;
}): ActivityService => {
  const findActivitiesBySession = async (sessionId: number) => {
    const activities = await activityRepository.findActivities({ sessionId });

    return activities.sort((a, b) => a.eventAt.getTime() - b.eventAt.getTime());
  };

  const createActivity = async (input: CreateActivityInput) => {
    if (!input.event) {
      throw new ValidationError('Activity event is required');
    }

    if (!input.sessionId) {
      throw new ValidationError('Session is required');
    }

    return activityRepository.createActivity({
      event: input.event,
      eventAt: new Date(),
      session: {
        connect: {
          id: input.sessionId,
        },
      },
    });
  };

  return {
    findActivitiesBySession,
    createActivity,
  };
};
