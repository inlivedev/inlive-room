'use client';

import {
  createContext,
  useContext,
  type Dispatch,
  type SetStateAction,
} from 'react';
import type { UserType } from '@/_types/user';

export const defaultValue = {
  user: null as UserType.AuthUserData | null,
};

type SetAuthState = Dispatch<SetStateAction<typeof defaultValue>>;

export const AuthContext = createContext({
  ...defaultValue,
  setAuthState: null as null | SetAuthState,
});

export const useAuthContext = () => {
  return useContext(AuthContext);
};
