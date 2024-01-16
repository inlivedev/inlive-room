'use client';

import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';
import type { UserType } from '@/_shared/types/auth';

const AuthContext = createContext({
  user: null as UserType.AuthUserContext | null,
  setUser: (() => {}) as Dispatch<
    SetStateAction<UserType.AuthUserContext | null>
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
  user: UserType.AuthUserContext | null;
}) {
  const [userState, setUserState] = useState<UserType.AuthUserContext | null>(
    user
  );

  return (
    <AuthContext.Provider value={{ user: userState, setUser: setUserState }}>
      {children}
    </AuthContext.Provider>
  );
}
