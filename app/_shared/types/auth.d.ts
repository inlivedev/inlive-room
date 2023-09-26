import type { FetcherResponse } from '@/_shared/utils/fetcher';

export declare namespace AuthType {
  type AuthorizeResponse = FetcherResponse & {
    message: string;
    data: string;
  };

  type AuthenticateExternalResponse = FetcherResponse & {
    message: string;
    data: {
      token: string;
    };
  };

  type AuthenticateInternalResponse = FetcherResponse & {
    message: string;
    data: {
      token: string;
    } | null;
  };

  type UserData = {
    email: string;
    id: number;
    login_type: number;
    name: string;
    picture_url: string;
    role_id: number;
    username: string;
  };

  type CurrentAuthExternalResponse = FetcherResponse & {
    message: string;
    data: UserData;
  };

  type CurrentAuthInternalResponse = FetcherResponse & {
    message: string;
    data: UserData | null;
  };

  type SignOutResponse = FetcherResponse & {
    message: string;
    data: null;
  };
}
