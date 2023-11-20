import { isError } from 'lodash-es';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { eventRepo } from '../../_index';
import { insertParticipant } from '@/(server)/_features/event/schema';
import { generateID } from '@/(server)/_shared/utils/generateid';
import { SendEventInvitationEmail } from '@/(server)/_shared/mailer/mailer';

type RegisterParticipant = {
  firstName: string;
  lastName: string;
  email: string;
  description: string;
  data: Map<string, string>;
};

export async function POST(request: Request, params: { slug: string }) {
  const slug = params.slug;
  const cookieStore = cookies();
  const requestToken = cookieStore.get('token');

  if (!requestToken) {
    return NextResponse.json(
      {
        code: 401,
        message: 'Please check if token is provided in the cookie',
      },
      { status: 401 }
    );
  }

  try {
    const body = (await request.json()) as RegisterParticipant;

    const existingEvent = await eventRepo.getEvent(slug);

    if (!existingEvent) {
      return NextResponse.json({
        code: 404,
        message: 'Event not found',
      });
    }

    const newParticipant: typeof insertParticipant = {
      clientId: generateID(8),
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      descrtiption: body.description,
      data: body.data,
    };

    const registeredParticipant = await eventRepo.registerParticipant(
      newParticipant,
      existingEvent.id
    );

    SendEventInvitationEmail(
      newParticipant.firstName + ' ' + newParticipant.lastName,
      newParticipant.email,
      existingEvent
    );

    return NextResponse.json(
      {
        code: 200,
        message: 'Event joined',
        data: registeredParticipant,
      },
      { status: 200 }
    );
  } catch (error) {
    if (!isError(error)) {
      const response = {
        code: 500,
        message: 'an error has occured on our side please try again later',
      };

      return NextResponse.json(response, { status: 500 });
    }

    const response = {
      code: 500,
      message: error.message,
    };

    return NextResponse.json(response, { status: 500 });
  }
}
