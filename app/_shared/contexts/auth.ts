'use client';

import {
  createContext,
  useContext,
  type Dispatch,
  type SetStateAction,
} from 'react';
import type { AuthType } from '@/_shared/types/auth';

export const defaultValue = {
  currentUser: undefined as AuthType.UserData | undefined,
};

type SetAuthState = Dispatch<SetStateAction<typeof defaultValue>>;

export const AuthContext = createContext({
  ...defaultValue,
  setAuthState: undefined as undefined | SetAuthState,
});

export const useAuthContext = () => {
  return useContext(AuthContext);
};
