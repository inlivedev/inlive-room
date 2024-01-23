import type { FetcherResponse } from '@/_shared/utils/fetcher';

export declare namespace AuthType {
  type CurrentAuthExternalData = {
    id: number;
    email: string;
    name: string;
    picture_url: string;
  };

  type CurrentAuthData = {
    id: number;
    email: string;
    name: string;
    pictureUrl: string;
    whitelistFeature: string[];
    createdAt: string;
  };

  type CurrentAuthContext = {
    id: number;
    email: string;
    name: string;
    pictureUrl: string;
    whitelistFeature: string[];
  };

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
    data: CurrentAuthExternalData;
  };

  type CurrentAuthResponse = FetcherResponse & {
    message: string;
    data: CurrentAuthData | null;
  };

  type SignOutResponse = FetcherResponse & {
    message: string;
    data: null;
  };
}
