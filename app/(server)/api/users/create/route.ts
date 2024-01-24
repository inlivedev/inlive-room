import { NextResponse, type NextRequest } from 'next/server';
import { InsertUser } from '@/(server)/_features/user/schema';
import { userService } from '../../_index';

export async function POST(request: NextRequest) {
  const body: InsertUser = await request.json();

  if (
    !body.email ||
    typeof body.email !== 'string' ||
    !body.name ||
    typeof body.name !== 'string'
  ) {
    return NextResponse.json(
      {
        code: 400,
        message: 'Valid email and name are required.',
        ok: false,
        data: null,
      },
      {
        status: 400,
      }
    );
  }

  try {
    const existingUser = await userService.getUserByEmail(body.email);

    if (existingUser) {
      return NextResponse.json(
        {
          code: 409,
          message: `A user already exists with the same email provided.`,
          ok: false,
          data: null,
        },
        { status: 409 }
      );
    }

    const data = {
      email: body.email,
      name: body.name,
      accountId: typeof body.accountId === 'number' ? body.accountId : null,
      pictureUrl: typeof body.pictureUrl === 'string' ? body.pictureUrl : null,
      whitelistFeature: Array.isArray(body.whitelistFeature)
        ? body.whitelistFeature
        : [],
    };

    const user = await userService.createUser(data);

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
        message: `An error has occured on our side, please try again later. ${
          error.message || ''
        }`,
      },
      { status: 500 }
    );
  }
}