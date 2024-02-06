'use client';

import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';
import type { AuthType } from '@/_shared/types/auth';

const AuthContext = createContext({
  user: null as AuthType.CurrentAuthContext | null,
  setUser: (() => {}) as Dispatch<
    SetStateAction<AuthType.CurrentAuthContext | null>
  >,
});

export const useAuthContext = () => {
  return useContext(AuthContext);
};

export function AuthProvider({
  children,
  user,
}: {
  children: React.ReactNode;
  user: AuthType.CurrentAuthContext | null;
}) {
  const [userState, setUserState] =
    useState<AuthType.CurrentAuthContext | null>(user);

  return (
    <AuthContext.Provider value={{ user: userState, setUser: setUserState }}>
      {children}
    </AuthContext.Provider>
  );
}
