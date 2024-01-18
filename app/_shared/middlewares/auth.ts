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

    if (request.nextUrl.pathname.startsWith('/health')) {
      return response;
    }

    if (response) {
      const cookie = cookies().toString();

      try {
        const clientAuthResponse: AuthType.CurrentAuthResponse =
          await InternalApiFetcher.get('/api/auth/current', {
            headers: {
              cookie: cookie,
            },
            cache: 'no-cache',
          });

        const currentAuth = clientAuthResponse.data
          ? clientAuthResponse.data
          : null;

        response.headers.set('user-auth', JSON.stringify(currentAuth));
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
