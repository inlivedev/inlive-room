import { NextResponse, type NextRequest } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { InliveApiFetcher } from '@/_shared/utils/fetcher';
import { userService } from '@/(server)/api/_index';
import type { AuthType } from '@/_shared/types/auth';

const persistentData = process.env.PERSISTENT_DATA === 'true';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization') || '';

    const authResponse: AuthType.CurrentAuthExternalResponse =
      await InliveApiFetcher.get('/auth/current', {
        headers: {
          Authorization: token,
        },
        cache: 'no-cache',
      });

    if (authResponse.code === 403) {
      return NextResponse.json(
        {
          code: 403,
          message: 'Forbidden. Invalid credential.',
          ok: false,
          data: null,
        },
        {
          status: 403,
        }
      );
    }

    if (!authResponse.ok) {
      Sentry.captureMessage(
        `API call error when trying to get current auth data. ${
          authResponse?.message || ''
        }`,
        'error'
      );

      throw new Error(authResponse.message || '');
    }

    if (!persistentData) {
      return NextResponse.json(
        {
          code: 200,
          message: 'OK',
          ok: true,
          data: {
            id: authResponse.data.id,
            email: authResponse.data.email,
            name: authResponse.data.name,
            pictureUrl: authResponse.data.picture_url,
            whitelistFeature: [],
            createdAt: null,
          },
        },
        {
          status: 200,
        }
      );
    }

    const user = await userService.getUserByEmail(authResponse.data.email);

    if (!user) {
      return NextResponse.json(
        {
          code: 404,
          message: 'The user data is not found.',
          ok: false,
          data: null,
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(
      {
        code: 200,
        message: 'OK',
        ok: true,
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          pictureUrl: user.pictureUrl,
          whitelistFeature: user.whitelistFeature,
          createdAt: user.createdAt,
        },
      },
      {
        status: 200,
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        code: 500,
        message: `Unexpected error on our side. API cannot retrieve the auth data.`,
        ok: false,
        data: null,
      },
      {
        status: 500,
      }
    );
  }
}
