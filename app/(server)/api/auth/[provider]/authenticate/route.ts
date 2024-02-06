import { NextResponse, type NextRequest } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { InliveApiFetcher } from '@/_shared/utils/fetcher';
import { getUserByEmail, addUser } from '@/(server)/_features/user/repository';
import { getEarlyAccessInviteeByEmail } from '@/(server)/_features/early-access-invitee/repository';
import type { AuthType } from '@/_shared/types/auth';

const APP_ORIGIN = process.env.NEXT_PUBLIC_APP_ORIGIN || '';
const persistentData = process.env.PERSISTENT_DATA === 'true';

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

      if (authResponse.code === 400) {
        return NextResponse.json(
          {
            code: 400,
            message: 'Bad Request. Invalid authentication request.',
            ok: false,
            data: null,
          },
          {
            status: 400,
          }
        );
      }

      if (!authResponse.ok) {
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

      const token = authResponse?.data?.token;

      if (!token) {
        Sentry.captureMessage(
          `Authentication error. No token credential received from the server.`,
          'error'
        );
        throw new Error(
          `Authentication error. No token credential received from the server.`
        );
      } else {
        if (persistentData) {
          const currentAuth: AuthType.CurrentAuthExternalResponse =
            await InliveApiFetcher.get('/auth/current', {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              cache: 'no-cache',
            });

          if (currentAuth.code === 403) {
            Sentry.captureMessage(
              `Authentication error. Invalid token credential received from the server.`,
              'error'
            );

            throw new Error(
              'Invalid token credential received from the server.'
            );
          }

          if (!currentAuth.ok) {
            Sentry.captureMessage(
              `API call error when trying to get current auth data. ${
                authResponse?.message || ''
              }`,
              'error'
            );

            throw new Error(authResponse.message || '');
          }

          if (
            !currentAuth.data.email ||
            typeof currentAuth.data.email !== 'string' ||
            !currentAuth.data.name ||
            typeof currentAuth.data.name !== 'string' ||
            !currentAuth.data.id ||
            typeof currentAuth.data.id !== 'number'
          ) {
            throw new Error('Valid ID, email, name are required.');
          }

          const existingUser = await getUserByEmail(currentAuth.data.email);

          if (!existingUser) {
            const userData = {
              email: currentAuth.data.email,
              name: currentAuth.data.name,
              accountId: currentAuth.data.id,
              pictureUrl: currentAuth.data.picture_url,
              whitelistFeature: [] as string[],
            };

            const existingEarlyAccessInvitee =
              await getEarlyAccessInviteeByEmail(userData.email);

            if (existingEarlyAccessInvitee) {
              userData.whitelistFeature =
                existingEarlyAccessInvitee.whitelistFeature;
              await addUser(userData);
            } else {
              await addUser(userData);
            }
          }
        }

        const response = NextResponse.redirect(
          `${APP_ORIGIN}${pathnameCookie}`,
          {
            status: 307,
          }
        );

        const oneWeek = 60 * 60 * 24 * 7;

        response.cookies.set({
          name: 'token',
          value: token,
          path: '/',
          sameSite: 'lax',
          httpOnly: true,
          maxAge: oneWeek,
        });

        return response;
      }
    } else {
      return NextResponse.json(
        {
          code: 400,
          message: 'Bad Request. Invalid authentication request.',
          ok: false,
          data: null,
        },
        {
          status: 400,
        }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        code: 500,
        message: `Unexpected error on our side. ${error.message || ''}`,
        ok: false,
        data: null,
      },
      {
        status: 500,
      }
    );
  }
}
