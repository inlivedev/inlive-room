import type { FetcherResponse } from '@/_shared/utils/fetcher';
import type { UserType } from '@/_shared/types/auth';

export declare namespace UserType {
  type AuthUserResponse = {
    email: string;
    id: number;
    login_type: number;
    name: string;
    picture_url: string;
    role_id: number;
    username: string;
  };

  type AuthUserContext = {
    userID: number;
    email: string;
    name: string;
    pictureUrl: string;
    webinarEnabled: boolean;
  };
}

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

  type CurrentAuthExternalResponse = FetcherResponse & {
    message: string;
    data: UserType.AuthUserResponse;
  };

  type CurrentAuthInternalResponse = FetcherResponse & {
    message: string;
    data: UserType.AuthUserResponse | null;
  };

  type SignOutResponse = FetcherResponse & {
    message: string;
    data: null;
  };
}
