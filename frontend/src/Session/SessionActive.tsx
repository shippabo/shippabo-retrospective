import React from 'react';

import api, { Activity, Session, User } from '../api';
import { useParams } from 'react-router';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/20/solid';
import { Link } from 'react-router-dom';
import UserList from '../User/UserList';
import SessionJoin from './SessionJoin';
import { isPast } from 'date-fns';
import ActivityList from '../Activity/ActivityList';
import { UserContext } from '../User/UserContext';

export default function SessionActive() {
  const { sessionId: _sessionId } = useParams();

  const { getSessionUser, setSessionUser } = React.useContext(UserContext);

  const [isJoining, setJoin] = React.useState(false);

  if (!_sessionId || Number.isNaN(_sessionId)) {
    throw new Error('Session ID is required');
  }

  const sessionId = Number(_sessionId);

  const [session, setSession] = React.useState<Session>();
  const [activities, setActivities] = React.useState<Activity[]>([]);
  const [users, setUsers] = React.useState<User[]>([]);

  const userId = getSessionUser(sessionId);

  const user = React.useMemo(() => users.find((user) => user.id === userId), [users, userId]);

  React.useEffect(() => {
    api
      .get('/session/{sessionId}/users', {
        params: {
          sessionId,
        },
      })
      .then((res) => {
        if (res.status === 200) {
          setUsers(res.data);
        }
      });

    return api.subscribe('SESSION_USERS', ({ users }) => setUsers(users));
  }, [sessionId]);

  React.useEffect(() => {
    api
      .get('/session/{sessionId}/activities', {
        params: {
          sessionId,
        },
      })
      .then((res) => {
        if (res.status === 200) {
          setActivities(res.data);
        }
      });

    return api.subscribe('SESSION_ACTIVITIES', ({ activities }) => setActivities(activities));
  }, [sessionId]);

  React.useEffect(() => {
    api
      .get('/session/{sessionId}', {
        params: {
          sessionId,
        },
      })
      .then((res) => {
        if (res.status === 200) {
          setSession(res.data);
        }
      });

    return api.subscribe('SESSION', ({ session }) => setSession(session));
  }, [sessionId]);

  const onJoinCancel = React.useCallback(() => {
    setJoin(false);
  }, []);

  const onJoinSession = React.useCallback(async () => {
    setJoin(true);
  }, []);

  const onStartSession = React.useCallback(async () => {
    if (!userId) {
      throw new Error('Not a user of this session');
    }

    const res = await api.post('/session/{sessionId}/user/{userId}/start', {
      params: {
        sessionId,
        userId,
      },
    });

    if (res.status === 200) {
      setSession(res.data);
    }
  }, []);

  const onStopSession = React.useCallback(async () => {
    if (!userId) {
      throw new Error('Not a user of this session');
    }

    const { status, data } = await api.post('/session/{sessionId}/user/{userId}/stop', {
      params: {
        sessionId,
        userId,
      },
    });

    if (status === 200) {
      setSession(data);
    }
  }, []);

  const onJoinSuccess = React.useCallback(
    async (userId: number) => {
      setJoin(false);

      setSessionUser(sessionId, userId);
    },
    [sessionId],
  );

  return (
    <>
      <div className="h-screen text-slate-400 bg-slate-900">
        <div className="py-8 space-y-4">
          <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between">
            <Link
              to="/api"
              target="_blank"
              className="inline-flex rounded-full bg-slate-800 py-2 px-4 text-sm font-medium text-white hover:bg-slate-700"
            >
              View OpenAPI Schema
              <ArrowTopRightOnSquareIcon className="ml-2 -mr-0.5 h-5 w-5" aria-hidden="true" />
            </Link>

            <div className="space-x-2">
              {user?.isHost &&
              session?.startedAt &&
              isPast(new Date(session.startedAt)) &&
              !session?.stoppedAt ? (
                <button
                  onClick={onStopSession}
                  className="inline-flex rounded-full bg-slate-800 py-2 px-4 text-sm font-medium text-white hover:bg-slate-700"
                >
                  Stop
                </button>
              ) : null}

              {user?.isHost && !session?.stoppedAt ? (
                <button
                  onClick={onStartSession}
                  className="inline-flex rounded-full bg-slate-800 py-2 px-4 text-sm font-medium text-white hover:bg-slate-700"
                >
                  {session?.startedAt && isPast(new Date(session.startedAt))
                    ? 'Reshuffle'
                    : 'Start'}
                </button>
              ) : null}

              {!user && !session?.stoppedAt ? (
                <button
                  onClick={onJoinSession}
                  className="inline-flex rounded-full bg-slate-800 py-2 px-4 text-sm font-medium text-white hover:bg-slate-700"
                >
                  Join
                </button>
              ) : null}
            </div>
          </header>

          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2">
              <div className="flex justify-between">
                <h3 className="mt-6 text-lg leading-6 font-bold text-slate-100">
                  {user ? `Welcome ${user.name}!` : ''}
                </h3>

                <h3 className="mt-6 text-lg leading-6 font-bold text-slate-100">{session?.name}</h3>
              </div>
            </div>

            <div className="mt-6 grid md:grid-cols-2 space-x-8">
              <UserList users={users} />

              <ActivityList activities={activities} />
            </div>
          </section>
        </div>
      </div>

      <SessionJoin
        isOpen={isJoining}
        sessionId={sessionId}
        onSuccess={onJoinSuccess}
        onClose={onJoinCancel}
      />
    </>
  );
}
