import React from 'react';

import { User } from '../api';

export const UserContext = React.createContext<{
  getSessionUser: (sessionId: number) => number | null;
  setSessionUser: (sessionId: number, userId: number) => void;
}>({
  getSessionUser: () => null,
  setSessionUser: () => {},
});

export type UserProviderProps = {
  children: React.ReactNode;
};

export default function UserProvider({ children }: UserProviderProps) {
  const getSessionUser = React.useCallback((sessionId: number) => {
    const user = localStorage.getItem(`session-${sessionId}-user`);

    return user ? Number(user) : null;
  }, []);

  const setSessionUser = React.useCallback((sessionId: number, userId: number) => {
    localStorage.setItem(`session-${sessionId}-user`, userId.toString());
  }, []);

  return (
    <UserContext.Provider value={{ getSessionUser, setSessionUser }}>
      {children}
    </UserContext.Provider>
  );
}
