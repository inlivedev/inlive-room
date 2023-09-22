'use client';

import { AuthContext } from '@/_shared/contexts/auth';
import type { AuthType } from '@/_shared/types/auth';

export default function AuthProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: {
    currentUser: AuthType.UserData | null;
  };
}) {
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
