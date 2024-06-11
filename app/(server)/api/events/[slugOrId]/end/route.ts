import { getCurrentAuthenticated } from '@/(server)/_shared/utils/get-current-authenticated';
import { eventRepo } from '@/(server)/api/_index';
import { EventType } from '@/_shared/types/event';
import { cookies } from 'next/headers';

export async function PUT(
  request: Request,
  { params }: { params: { slugOrId: string } }
) {
  let existingEvent: EventType.Event | undefined;
  const cookieStore = cookies();
  const requestToken = cookieStore.get('token');

  const getUserResp = await getCurrentAuthenticated(requestToken?.value || '');

  if (!getUserResp.data) {
    return new Response(
      JSON.stringify({
        code: 401,
        ok: false,
        message: 'Please check if token is provided in the cookie',
      }),
      { status: 401 }
    );
  }

  const user = getUserResp.data;

  const slugOrId = params.slugOrId;
  const isnum = /^\d+$/.test(slugOrId);

  if (isnum) {
    existingEvent = await eventRepo.getEventById(parseInt(slugOrId));
  } else {
    existingEvent = await eventRepo.getEventBySlug(slugOrId);
  }

  if (!existingEvent) {
    return new Response(
      JSON.stringify({
        code: 404,
        ok: false,
        message: 'Event not found',
      }),
      { status: 404 }
    );
  }

  if (existingEvent.status !== 'published') {
    return new Response(
      JSON.stringify({
        code: 400,
        ok: false,
        message: 'Event not yet published',
      }),
      { status: 400 }
    );
  }

  existingEvent.status = 'completed';

  //   Update the event status to completed
  const updatedEvent = await eventRepo.updateEvent(
    user.id,
    existingEvent.id,
    existingEvent
  );

  return new Response(
    JSON.stringify({
      code: 200,
      ok: true,
      message: 'Event has been completed',
      data: updatedEvent,
    }),
    { status: 200 }
  );
}
