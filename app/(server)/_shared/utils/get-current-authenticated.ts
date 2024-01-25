import * as Sentry from '@sentry/nextjs';
import { InliveApiFetcher } from '@/_shared/utils/fetcher';
import { getUserByEmail } from '@/(server)/_features/user/repository';
import type { AuthType } from '@/_shared/types/auth';

const persistentData = process.env.PERSISTENT_DATA === 'true';

export const getCurrentAuthenticated = async (token: string) => {
  try {
    const response: AuthType.CurrentAuthExternalResponse =
      await InliveApiFetcher.get('/auth/current', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-cache',
      });

    if (response.code === 403) {
      return {
        code: 403,
        message: 'Forbidden. Invalid credential.',
        ok: false,
        data: null,
      };
    }

    if (!response.ok) {
      Sentry.captureMessage(
        `API call error when trying to get current auth data. ${
          response?.message || ''
        }`,
        'error'
      );

      throw new Error(response.message || '');
    }

    if (!persistentData) {
      return {
        code: 200,
        message: 'OK',
        ok: true,
        data: {
          id: response.data.id,
          email: response.data.email,
          name: response.data.name,
          pictureUrl: response.data.picture_url,
          whitelistFeature: [],
          createdAt: null,
        },
      };
    }

    const user = await getUserByEmail(response.data.email);

    if (!user) {
      return {
        code: 404,
        message: 'The user data is not found.',
        ok: false,
        data: null,
      };
    }

    return {
      code: 200,
      message: 'OK',
      ok: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        pictureUrl: user.pictureUrl,
        whitelistFeature: user.whitelistFeature,
        createdAt: user.createdAt,
      },
    };
  } catch (error) {
    return {
      code: 500,
      message: `Unexpected error on our side. API cannot retrieve the auth data.`,
      ok: false,
      data: null,
    };
  }
};
