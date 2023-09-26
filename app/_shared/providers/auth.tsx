'use client';

import { useState } from 'react';
import { AuthContext, defaultValue } from '@/_shared/contexts/auth';
import type { AuthType } from '@/_shared/types/auth';

export default function AuthProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: {
    currentUser: AuthType.UserData | undefined;
  };
}) {
  const [authState, setAuthState] = useState<typeof defaultValue>({
    ...defaultValue,
    ...value,
  });

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        setAuthState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
