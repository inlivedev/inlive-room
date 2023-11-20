import {
  type NextFetchEvent,
  type NextMiddleware,
  type NextRequest,
} from 'next/server';
import { getClientAuth } from '@/_utils/get-client-auth';

export function withAuthMiddleware(middleware: NextMiddleware) {
  return async (request: NextRequest, event: NextFetchEvent) => {
    const response = await middleware(request, event);

    if (request.nextUrl.pathname.startsWith('/health')) {
      return response;
    }

    if (response) {
      try {
        const clientAuthResponse = await getClientAuth();
        const currentAuth = clientAuthResponse.data
          ? clientAuthResponse.data
          : null;

        response.headers.set('user-auth', JSON.stringify(currentAuth));
      } catch (error) {}
    }

    return response;
  };
}
