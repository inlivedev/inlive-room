'use client';

import { createContext, useContext } from 'react';
import type { AuthType } from '@/_shared/types/auth';

const defaultValue = {
  currentUser: null as AuthType.UserData | null,
};

export const AuthContext = createContext(defaultValue);

export const useAuthContext = () => {
  return useContext(AuthContext);
};
