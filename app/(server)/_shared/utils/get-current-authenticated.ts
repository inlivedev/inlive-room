import * as Sentry from '@sentry/nextjs';
import { InliveApiFetcher } from '@/_shared/utils/fetcher';
import type { AuthType } from '@/_shared/types/auth';

export const getCurrentAuthenticated = async (token: string) => {
  const response: AuthType.CurrentAuthExternalResponse =
    await InliveApiFetcher.get('/auth/current', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-cache',
    });

  if (!response || !response.ok) {
    Sentry.captureMessage(
      `API call error when trying to get current auth data`,
      'error'
    );
  }

  const data = response.data || {};

  const result = {
    code: response.code,
    message: response.message || '',
    ok: response.ok,
    data: {
      email: data.email || '',
      id: data.id || 0,
      name: data.name || '',
      pictureUrl: data.picture_url || '',
    },
  };

  return result;
};
