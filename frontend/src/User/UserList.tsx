import React from 'react';
import { ChevronRightIcon } from '@heroicons/react/20/solid';
import { User } from '../api';

export type UserListProps = {
  users: Array<User>;
};

export default function UserList(props: UserListProps) {
  const { users } = props;

  return (
    <div className="overflow-hidden ring-1 ring-slate-100/10 bg-slate-800 shadow sm:rounded-md">
      <ul role="list" className="divide-y divide-slate-600">
        {!users.length ? (
          <li className="px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="text-xl text-slate-100">No one is here yet</div>
            </div>
          </li>
        ) : null}

        {users.map((user) => (
          <li key={user.id}>
            <a className="block hover:bg-slate-700">
              <div className="flex items-center px-4 py-4 sm:px-6">
                <div className="flex min-w-0 flex-1 items-center">
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-sm font-bold text-blue-800">
                    {user.order}
                  </span>

                  <div className="flex min-w-0 flex-1 px-4">
                    <p className="truncate text-xl font-medium text-sky-500">{user.name}</p>
                  </div>
                </div>

                <div>
                  <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                </div>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
