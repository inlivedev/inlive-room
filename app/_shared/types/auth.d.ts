import type { FetcherResponse } from '@/_shared/utils/fetcher';
import * as z from 'zod';

export declare namespace AuthType {
  type CurrentAuthExternalData = {
    id: number;
    email: string;
    name: string;
    picture_url: string;
  };

  type RegisterAuthExternalData = FetcherResponse & {
    data: {
      id: number;
      username: string;
      password: string;
      confirm_password: string;
      name: string;
      login_type: string;
      email: string;
      role_id: number;
      picture_url: string;
      is_active: boolean;
    };
  };

  type CurrentAuthData = {
    id: number;
    email: string;
    name: string;
    pictureUrl: string;
    whitelistFeature: string[];
    createdAt: string | null;
    accountId: number;
  };

  type CurrentAuthContext = {
    id: number;
    email: string;
    name: string;
    pictureUrl: string;
    accountId: number;
    createdAt: string | null;
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
      refresh_token: string;
    };
  };

  type AuthenticateInternalResponse = FetcherResponse & {
    message: string;
    data: {
      token: string;
      refresh_token: string;
    } | null;
  };

  type CreateUserResponse = FetcherResponse & {
    message: string;
    data: CurrentAuthData | null;
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

  type RegisterAuthResponse = FetcherResponse & {
    message: string;
    data: RegisterAuthExternalData | null;
  };
}
