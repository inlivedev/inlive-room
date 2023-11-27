import { eventService } from '@/(server)/api/_index';
import { isError } from 'lodash-es';
import { NextResponse } from 'next/server';
import { GenerateIcal } from '../..';

export async function GET(
  _: Request,
  { params }: { params: { slug: string } }
) {
  const slug = params.slug;
  try {
    const event = await eventService.getEvent(slug);
    if (!event) {
      return NextResponse.json({
        code: 404,
        message: 'Event not found',
      });
    }

    const icalString = GenerateIcal(event);
    const resp = new Response(icalString);
    resp.headers.set('Content-Type', 'text/calendar');
    resp.headers.set('Content-Disposition', 'attachment; filename=invite.ics');
    resp.headers.set('Cache-Control', 'public, max-age=0, must-revalidate');

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
