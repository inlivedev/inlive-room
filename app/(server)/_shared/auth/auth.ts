import * as Sentry from '@sentry/nextjs';
import type { InliveApiFetcher } from '@/_shared/utils/fetcher';
import type { AuthType } from '@/_shared/types/auth';

export const createAuth = (fetcher: typeof InliveApiFetcher) => {
  const Auth = class {
    _fetcher;

    constructor() {
      this._fetcher = fetcher;
    }

    getCurrentAuthenticated = async (token: string) => {
      const response: AuthType.CurrentAuthExternalResponse =
        await this._fetcher.get('/auth/current', {
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

    authorize = async (
      provider: string,
      redirectUri: string,
      oauthState: string
    ) => {
      const body = {
        provider,
        oauthState,
        redirectUri,
      };

      const response: AuthType.AuthorizeResponse = await this._fetcher.post(
        `/auth/${provider}/authorize`,
        {
          body: JSON.stringify(body),
        }
      );

      if (!response || !response.ok) {
        Sentry.captureMessage(
          `API call error when trying to authorize user. ${
            response?.message || ''
          }`,
          'error'
        );
      }

      return response;
    };

    authenticate = async (
      provider: string,
      redirectUri: string,
      authCode: string
    ) => {
      const body = {
        code: authCode,
        redirectURI: redirectUri,
      };

      const response: AuthType.AuthenticateExternalResponse =
        await this._fetcher.post(`/auth/${provider}/authenticate`, {
          body: JSON.stringify(body),
        });

      if (!response || !response.ok) {
        Sentry.captureMessage(
          `API call error when trying to authenticate user. ${
            response?.message || ''
          }`,
          'error'
        );
      }

      const data = response.data || {};

      const result = {
        code: response.code,
        ok: response.ok,
        message: response.message || '',
        data: {
          token: data.token || '',
        },
      };

      return result;
    };
  };

  return {
    createInstance: () => {
      const authService = new Auth();

      return {
        getCurrentAuthenticated: authService.getCurrentAuthenticated,
        authorize: authService.authorize,
        authenticate: authService.authenticate,
      };
    },
  };
};
