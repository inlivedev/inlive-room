'use client';

import {
  createContext,
  useContext,
  type Dispatch,
  type SetStateAction,
} from 'react';
import type { UserType } from '@/_shared/types/user';

export const defaultValue = {
  user: undefined as UserType.AuthUserData | undefined,
};

type SetAuthState = Dispatch<SetStateAction<typeof defaultValue>>;

export const AuthContext = createContext({
  ...defaultValue,
  setAuthState: undefined as undefined | SetAuthState,
});

export const useAuthContext = () => {
  return useContext(AuthContext);
};
