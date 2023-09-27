import { cookies } from 'next/headers';
import { InternalApiFetcher } from '@/_shared/utils/fetcher';
import type { AuthType } from '@/_shared/types/auth';

export const getClientAuth = async () => {
  const cookie = cookies().toString();
  const currentAuth: AuthType.CurrentAuthInternalResponse =
    await InternalApiFetcher.get('/api/auth/current', {
      headers: {
        cookie: cookie,
      },
      cache: 'no-cache',
    });

  return currentAuth;
};
