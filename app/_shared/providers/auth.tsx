'use client';

import { useState } from 'react';
import { AuthContext, defaultValue } from '@/_shared/contexts/auth';
import type { UserType } from '@/_shared/types/user';

export default function AuthProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: {
    user: UserType.AuthUserData | null;
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
