import { eventService } from '@/(server)/api/_index';
import { isError } from 'lodash-es';
import { NextResponse } from 'next/server';
import { GenerateIcal } from '../../..';

export async function GET(
  _: Request,
  { params }: { params: { slugOrId: string; participantId: number } }
) {
  const slug = decodeURIComponent(params.slugOrId);
  const participantId = params.participantId;

  try {
    const event = await eventService.getEventBySlugOrID(slug);
    if (!event) {
      return NextResponse.json({
        code: 404,
        message: 'Event not found',
      });
    }

    const host = await eventService.getEventHostByEventId(event.id);
    if (!host) {
      return NextResponse.json({
        code: 404,
        message: 'Host not found',
      });
    }

    const participant = await eventService.getParticipantById(participantId);
    if (!participant) {
      return NextResponse.json({
        code: 404,
        message: 'Participant not found',
      });
    }

    const icalString = GenerateIcal(
      event,
      'meeting',
      'Asia/Jakarta',
      host,
      participant
    );
    const resp = new Response(icalString);
    resp.headers.set(
      'Content-Type',
      'text/calendar; charset=utf-8; name=invite.ics'
    );
    resp.headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
    resp.headers.set('Content-Transfer-Encoding', 'base64');

    return resp;
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
