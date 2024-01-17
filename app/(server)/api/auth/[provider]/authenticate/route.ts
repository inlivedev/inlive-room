import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import * as Sentry from '@sentry/nextjs';
import { InliveApiFetcher } from '@/_shared/utils/fetcher';
import type { AuthType } from '@/_shared/types/auth';

const APP_ORIGIN = process.env.NEXT_PUBLIC_APP_ORIGIN || '';

export async function GET(
  request: NextRequest,
  { params }: { params: { provider: string } }
) {
  try {
    const url = new URL(request.url);
    const currentPath = APP_ORIGIN + url.pathname;
    const codeParam = url.searchParams.get('code') || '';
    const stateParam = url.searchParams.get('state') || '';
    const stateCookie = request.cookies.get('state')?.value || '';
    const pathnameCookie = request.cookies.get('pathname')?.value || '';
    const provider = params.provider;

    if (stateParam === stateCookie) {
      const body = {
        code: codeParam,
        redirectURI: currentPath,
      };

      const authResponse: AuthType.AuthenticateExternalResponse =
        await InliveApiFetcher.post(`/auth/${provider}/authenticate`, {
          body: JSON.stringify(body),
        });

      if (!authResponse || !authResponse.ok) {
        Sentry.captureMessage(
          `API call error when trying to authenticate user. ${
            authResponse?.message || ''
          }`,
          'error'
        );

        throw new Error(
          `Authentication error when trying to authenticate with ${provider} SSO`
        );
      }

      if (!authResponse.data || !authResponse.data.token) {
        Sentry.captureMessage(
          `Authentication error. No token received from the server.`,
          'error'
        );
        throw new Error(
          `Authentication error. No token received from the server.`
        );
      } else {
        const thirtyDays = 60 * 60 * 24 * 30;

        cookies().set({
          name: 'token',
          value: authResponse.data.token,
          path: '/',
          sameSite: 'lax',
          httpOnly: true,
          maxAge: thirtyDays,
        });

        return NextResponse.redirect(`${APP_ORIGIN}${pathnameCookie}`, {
          status: 307,
        });
      }
    } else {
      return NextResponse.json(
        {
          code: 403,
          message:
            'Forbidden to proceed further. Incorrect authentication state.',
          ok: false,
          data: null,
        },
        {
          status: 403,
        }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        code: 500,
        message: `Authentication error. ${error.message || ''}`,
        ok: false,
        data: null,
      },
      {
        status: 500,
      }
    );
  }
}
