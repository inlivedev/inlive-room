import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import * as Sentry from '@sentry/nextjs';
import { InliveApiFetcher } from '@/_shared/utils/fetcher';
import type { AuthType } from '@/_shared/types/auth';

const APP_ORIGIN = process.env.NEXT_PUBLIC_APP_ORIGIN || '';

export async function POST(
  request: NextRequest,
  { params }: { params: { provider: string } }
) {
  try {
    const provider = params.provider;
    const { pathname = '' } = await request.json();
    const oauthState = crypto.randomUUID();
    const relativeRedirectUri = `/api/auth/${provider}/authenticate`;
    const absoluteRedirectUri = `${APP_ORIGIN}${relativeRedirectUri}`;

    const body = {
      provider,
      redirectUri: absoluteRedirectUri,
      oauthState: oauthState,
    };

    const authorizeResponse: AuthType.AuthorizeResponse =
      await InliveApiFetcher.post(`/auth/${provider}/authorize`, {
        body: JSON.stringify(body),
      });

    if (!authorizeResponse || !authorizeResponse.ok) {
      Sentry.captureMessage(
        `Authorization error when trying to connect with ${provider} SSO. ${
          authorizeResponse?.message || ''
        }`,
        'error'
      );

      throw new Error(
        `Authorization error when trying to authorize to ${provider} SSO`
      );
    } else {
      const oneMonth = 3600 * 24 * 30;

      cookies().set({
        name: 'state',
        value: oauthState,
        path: relativeRedirectUri,
        sameSite: 'lax',
        maxAge: oneMonth,
        httpOnly: true,
      });

      cookies().set({
        name: 'pathname',
        value: pathname,
        path: relativeRedirectUri,
        sameSite: 'lax',
        maxAge: oneMonth,
        httpOnly: true,
      });

      return NextResponse.json(
        {
          code: 200,
          ok: true,
          message: 'Authorization successful',
          data: authorizeResponse.data,
        },
        {
          status: 200,
        }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        code: 500,
        message: `Authorization error. ${error.message || ''}`,
        ok: false,
        data: null,
      },
      {
        status: 500,
      }
    );
  }
}
