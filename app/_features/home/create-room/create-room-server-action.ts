'use server';

import { cookies } from 'next/headers';

export const createHostCookieAction = async () => {
  cookies().set({
    name: 'host',
    value: 'true',
    httpOnly: true,
  });
};
