import { isError, omit } from 'lodash-es';
import { NextResponse } from 'next/server';
import { eventRepo } from '../../../_index';
import {
  insertParticipant,
  selectParticipant,
} from '@/(server)/_features/event/schema';
import {
  SendEventInvitationEmail,
  isMailerEnabled,
} from '@/(server)/_shared/mailer/mailer';
import { generateID } from '@/(server)/_shared/utils/generateid';
import { EventType } from '@/_shared/types/event';

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
  const slugOrId = params.slugOrId;
  const currentTime = new Date();
  const isnum = /^\d+$/.test(slugOrId);
  let existingEvent: EventType.Event | undefined;

  try {
    let participant: selectParticipant | undefined;
    const body = (await request.json()) as RegisterParticipant;

    if (isnum) {
      existingEvent = await eventRepo.getEventById(parseInt(slugOrId));
    } else {
      existingEvent = await eventRepo.getEventBySlug(slugOrId);
    }

    existingEvent = await eventRepo.getEventBySlug(slugOrId);

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

    if (existingEvent.maximumSlots) {
      if (existingEvent.availableSlots && existingEvent.availableSlots <= 0) {
        return NextResponse.json({
          code: 400,
          message: 'Event is full',
        });
      }
    }

    const newParticipant: insertParticipant = {
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      description: body.description,
      clientId: generateID(12),
      eventID: existingEvent.id,
      roleID: 1,
    };

    const previousParticipant = await eventRepo.getEventParticipantByEmail(
      newParticipant.email,
      existingEvent.id
    );

    if (previousParticipant && previousParticipant.createdAt) {
      participant = await eventRepo.updateParticipant({
        ...newParticipant,
        id: previousParticipant.id,
        createdAt: previousParticipant.createdAt,
        description: previousParticipant.description,
        updateCount: previousParticipant.updateCount + 1,
        isInvited: previousParticipant.isInvited,
        roleID: previousParticipant.roleID,
      });
    } else {
      participant = await eventRepo.registerParticipant(newParticipant);
    }

    const host = await eventRepo.getEventHostByEventId(existingEvent.id);

    if (!host) {
      return NextResponse.json({
        code: 404,
        message: 'Event host is not found',
      });
    }

    if (!participant) {
      return NextResponse.json({
        code: 500,
        message: 'Failed to register participant',
        ok: false,
      });
    }

    if (isMailerEnabled()) {
      SendEventInvitationEmail(participant, existingEvent, host);
    }

    const data: EventType.RegisterParticipantResponse['data'] = {
      event:
        currentTime.getTime() > existingEvent.startTime.getTime()
          ? existingEvent
          : omit(existingEvent, 'roomId'),
      participant: participant,
    };

    return NextResponse.json(
      {
        code: 200,
        message: 'Registered Successfully',
        data: data,
        ok: true,
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
