import { isError } from 'lodash-es';
import { NextResponse } from 'next/server';
import { eventRepo } from '../../../_index';
import { insertParticipant } from '@/(server)/_features/event/schema';
import { generateID } from '@/(server)/_shared/utils/generateid';
import {
  SendEventInvitationEmail,
  isMailerEnabled,
} from '@/(server)/_shared/mailer/mailer';

type RegisterParticipant = {
  firstName: string;
  lastName: string;
  email: string;
  description: string;
  data?: Map<string, string>;
};

export async function POST(
  request: Request,
  { params }: { params: { slugOrId: string } }
) {
  const slug = params.slugOrId;

  try {
    const body = (await request.json()) as RegisterParticipant;

    const existingEvent = await eventRepo.getEventBySlug(slug);

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
      description: body.description,
      data: body.data,
    };

    const registeredParticipant = await eventRepo.registerParticipant(
      newParticipant,
      existingEvent.id
    );

    if (isMailerEnabled()) {
      SendEventInvitationEmail(
        newParticipant.firstName,
        newParticipant.lastName,
        newParticipant.email,
        existingEvent
      );
    }

    return NextResponse.json(
      {
        code: 200,
        message: 'Registered Successfully',
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
