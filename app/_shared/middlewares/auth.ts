import {
  type NextFetchEvent,
  type NextMiddleware,
  type NextRequest,
} from 'next/server';
import { cookies } from 'next/headers';
import * as Sentry from '@sentry/nextjs';
import { InternalApiFetcher } from '@/_shared/utils/fetcher';
import type { AuthType } from '@/_shared/types/auth';

export function withAuthMiddleware(middleware: NextMiddleware) {
  return async (request: NextRequest, event: NextFetchEvent) => {
    const response = await middleware(request, event);

    const userCookiesKey = 'user-auth';

    if (request.nextUrl.pathname.startsWith('/health')) {
      return response;
    }

    if (response) {
      const cookiesAwaited = await cookies();
      const requestToken = cookiesAwaited.get('token');

      if (!requestToken) {
        response.headers.set(userCookiesKey, JSON.stringify(null));
        return response;
      }

      try {
        const userCookies = cookiesAwaited.get(userCookiesKey);
        let userData;

        if (!userCookies) {
          const user: AuthType.CurrentAuthResponse =
            await InternalApiFetcher.get('/api/auth/current', {
              headers: {
                Authorization: `Bearer ${requestToken?.value || ''}`,
              },
              cache: 'no-cache',
            });

          userData = user.data ? user.data : null;
        } else {
          userData = userCookies.value;
        }

        response.headers.set(userCookiesKey, JSON.stringify(userData));
      } catch (error) {
        Sentry.captureException(error, {
          extra: {
            message: 'API call error when trying to get current auth data',
          },
        });
        console.error(error);
        response.headers.set('user-auth', JSON.stringify(null));
      }
    }

    return response;
  };
}
