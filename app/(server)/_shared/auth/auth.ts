import type {
  InliveApiFetcher,
  FetcherResponse,
} from '@/_shared/utils/fetcher';

export interface UserData {
  email: string;
  id: number;
  login_type: number;
  name: string;
  picture_url: string;
  role_id: number;
  username: string;
}

type CurrentAuthResponse = FetcherResponse & {
  data: UserData;
  message: string;
  meta: string;
};

type AuthorizeResponse = FetcherResponse & {
  message: string;
  data: string;
};

type AuthenticateResponse = FetcherResponse & {
  message: string;
  data: {
    token: string;
  };
};

export const createAuth = (fetcher: typeof InliveApiFetcher) => {
  const Auth = class {
    _fetcher;

    constructor() {
      this._fetcher = fetcher;
    }

    getCurrentAuthenticated = async (token: string) => {
      const response: CurrentAuthResponse = await this._fetcher.get(
        '/auth/current',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data || {};

      const result = {
        code: response.code,
        message: response.message || '',
        ok: response.ok,
        data: {
          email: data.email || '',
          id: data.id || 0,
          loginType: data.login_type || 0,
          name: data.name || '',
          pictureUrl: data.picture_url || '',
          roleId: data.role_id || 0,
          username: data.username || '',
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

      const response: AuthorizeResponse = await this._fetcher.post(
        `/auth/${provider}/authorize`,
        {
          body: JSON.stringify(body),
        }
      );

      if (response.code > 299) {
        throw new Error(`${response.code} error! ${response.message}`);
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

      const response: AuthenticateResponse = await this._fetcher.post(
        `/auth/${provider}/authenticate`,
        {
          body: JSON.stringify(body),
        }
      );

      if (response.code > 299) {
        throw new Error(`${response.code} error! ${response.message}`);
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
