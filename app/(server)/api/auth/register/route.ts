import { addUser, getUserByEmail } from '@/(server)/_features/user/repository';
import { defaultLogger } from '@/(server)/_shared/logger/logger';
import { AuthType } from '@/_shared/types/auth';
import { InliveApiFetcher } from '@/_shared/utils/fetcher';
import { NextRequest, NextResponse } from 'next/server';
import * as z from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string(),
  username: z.string(),
  password: z.string(),
  repeat_password: z.string(),
});

const env = process.env.NEXT_PUBLIC_APP_ENV || 'production';

export async function POST(request: NextRequest) {
  if (env === 'production') {
    return NextResponse.json({
      status: 403,
      body: {
        error: 'Forbidden',
        message: 'Registration is disabled in production environment',
        data: null,
      },
    });
  }

  try {
    const body = registerSchema.parse(await request.json());

    const existingUser = await getUserByEmail(body.email);

    if (existingUser) {
      // return the user data
      return NextResponse.json({
        status: 200,
        body: {
          message: 'User already exists',
          data: {
            ...existingUser,
            isRegistered: true,
          },
        },
      });
    }

    const registerResponse: AuthType.RegisterAuthExternalData =
      await InliveApiFetcher.post('/auth/register', {
        body: JSON.stringify(body),
      });

    if (registerResponse.code !== 200) {
      const loginRequest = await InliveApiFetcher.post('/auth/login', {
        body: JSON.stringify({
          email: body.email,
          password: body.password,
          usermame: body.username,
        }),
      });

      if (loginRequest.code !== 200) {
        return NextResponse.json({
          status: loginRequest.code,
          body: {
            error: 'Bad Request',
            message: 'Remote server error',
            data: null,
          },
        });
      }
    }

    const newUser = await addUser({
      email: body.email,
      name: body.name,
      // We don't care but it must not empty
      accountId: registerResponse?.data?.id || 1,
      whitelistFeature: ['event', 'paid_webinar'],
      pictureUrl: null,
      isRegistered: true,
    });

    return NextResponse.json({
      status: 200,
      body: {
        message: 'User has been registered',
        data: newUser,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({
        status: 400,
        body: {
          error: 'Bad Request',
          message: error.message,
          data: null,
        },
      });
    }

    defaultLogger.captureException(error);

    return NextResponse.json({
      status: 500,
      body: {
        error: 'Internal Server Error',
        data: null,
      },
    });
  }
}
