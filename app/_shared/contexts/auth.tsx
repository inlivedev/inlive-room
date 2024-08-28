'use client';

import { createContext, useContext } from 'react';
import type { AuthType } from '@/_shared/types/auth';

const AuthContext = createContext({
  user: null as AuthType.CurrentAuthContext | null,
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
}) 

{
  return (
    <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
  );
}
