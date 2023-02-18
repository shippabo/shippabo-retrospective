import { format, isToday } from 'date-fns';
import React from 'react';
import { Activity } from '../api';

export type ActivityListProps = {
  activities: Array<Activity>;
};

export default function ActivityList(props: ActivityListProps) {
  const { activities } = props;

  return (
    <div className="flow-root py-2">
      <ul role="list" className="-mb-8">
        {activities.map((activity, index) => (
          <li key={activity.id}>
            <div className="relative pb-8">
              {index !== activities.length - 1 ? (
                <span
                  className="absolute top-4 left-1 -ml-px h-full w-0.5 bg-slate-400/50"
                  aria-hidden="true"
                />
              ) : null}

              <div className="relative flex space-x-3">
                <span className="h-2 w-2 mt-3 rounded-full bg-slate-400"></span>

                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                  <p className="text-sm text-gray-500">{activity.event}</p>

                  <div className="whitespace-nowrap text-right text-sm text-gray-500">
                    <time dateTime={activity.eventAt}>
                      {isToday(new Date(activity.eventAt))
                        ? format(new Date(activity.eventAt), 'h:mm aaa')
                        : format(new Date(activity.eventAt), 'M/d/yy h:mm aaa')}
                    </time>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
