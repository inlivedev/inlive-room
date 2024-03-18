import { isError } from 'lodash-es';
import { NextResponse } from 'next/server';
import { eventRepo } from '../../../_index';
import { insertParticipant } from '@/(server)/_features/event/schema';
import {
  SendEventInvitationEmail,
  isMailerEnabled,
} from '@/(server)/_shared/mailer/mailer';
import { generateID } from '@/(server)/_shared/utils/generateid';

type RegisterParticipant = {
  firstName: string;
  lastName: string;
  email: string;
  description: string;
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

    if (existingEvent.status !== 'published') {
      return NextResponse.json({
        code: 400,
        message: 'Event not found',
      });
    }

    const newParticipant: typeof insertParticipant = {
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      description: body.description,
      clientId: generateID(12),
      eventID: existingEvent.id,
      joinID: generateID(12),
    };

    const registeredParticipant = await eventRepo.registerParticipant(
      newParticipant
    );

    if (isMailerEnabled()) {
      SendEventInvitationEmail(
        newParticipant.firstName,
        newParticipant.lastName,
        newParticipant.email,
        existingEvent,
        registeredParticipant.joinID
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
