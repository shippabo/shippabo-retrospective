import React from 'react';

import api, { Session, User } from '../api';
import { useParams } from 'react-router';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/20/solid';
import { Link } from 'react-router-dom';
import UserList from '../User/UserList';
import SessionJoin from './SessionJoin';
import { isPast } from 'date-fns';

export default function SessionActive() {
  const { sessionId: _sessionId } = useParams();

  const [isJoining, setJoin] = React.useState(false);

  if (!_sessionId || Number.isNaN(_sessionId)) {
    throw new Error('Session ID is required');
  }

  const sessionId = Number(_sessionId);

  const [session, setSession] = React.useState<Session>();
  const [users, setUsers] = React.useState<User[]>([]);

  React.useEffect(() => {
    api
      .get('/session/{id}/users', {
        params: {
          id: sessionId,
        },
      })
      .then((res) => {
        if (res.status === 200) {
          setUsers(res.data);
        }
      });
  }, [sessionId]);

  React.useEffect(() => {
    api
      .get('/session/{id}', {
        params: {
          id: Number(sessionId),
        },
      })
      .then((res) => {
        if (res.status === 200) {
          setSession(res.data);
        }
      });
  }, [sessionId]);

  const onJoinCancel = React.useCallback(() => {
    setJoin(false);
  }, []);

  const onJoinSession = React.useCallback(async () => {
    setJoin(true);
  }, []);

  const onStartSession = React.useCallback(async () => {
    const startRes = await api.post('/session/{id}/start', {
      params: {
        id: sessionId,
      },
    });

    if (startRes.status === 200) {
      setSession(startRes.data);

      const usersRes = await api.get('/session/{id}/users', {
        params: {
          id: sessionId,
        },
      });

      if (usersRes.status === 200) {
        setUsers(usersRes.data);
      }
    }
  }, []);

  const onStopSession = React.useCallback(async () => {
    const { status, data } = await api.post('/session/{id}/stop', {
      params: {
        id: sessionId,
      },
    });

    if (status === 200) {
      setSession(data);
    }
  }, []);

  const onJoinSuccess = React.useCallback(async () => {
    setJoin(false);

    api
      .get('/session/{id}/users', {
        params: {
          id: sessionId,
        },
      })
      .then((res) => {
        if (res.status === 200) {
          setUsers(res.data);
        }
      });
  }, [sessionId]);

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
              {session?.startedAt && isPast(new Date(session.startedAt)) && !session?.stoppedAt ? (
                <button
                  onClick={onStopSession}
                  className="inline-flex rounded-full bg-slate-800 py-2 px-4 text-sm font-medium text-white hover:bg-slate-700"
                >
                  Stop
                </button>
              ) : null}

              {session && !session.stoppedAt ? (
                <button
                  onClick={onStartSession}
                  className="inline-flex rounded-full bg-slate-800 py-2 px-4 text-sm font-medium text-white hover:bg-slate-700"
                >
                  {session?.startedAt && isPast(new Date(session.startedAt))
                    ? 'Reshuffle'
                    : 'Start'}
                </button>
              ) : null}

              {session && !session.stoppedAt ? (
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
            <h3 className="mt-6 text-lg leading-6 font-bold text-slate-100">
              Current Users in "{session?.name}"
            </h3>

            <div className="mt-6 grid md:grid-cols-2">
              <UserList users={users} />
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
