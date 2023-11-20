import type { FetcherResponse } from '@/_utils/fetcher';
import type { UserType } from '@/_types/user';

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
    data: UserType.AuthUserData;
  };

  type CurrentAuthInternalResponse = FetcherResponse & {
    message: string;
    data: UserType.AuthUserData | null;
  };

  type SignOutResponse = FetcherResponse & {
    message: string;
    data: null;
  };
}
