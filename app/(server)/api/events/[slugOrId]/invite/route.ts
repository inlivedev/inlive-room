import { selectParticipant } from '@/(server)/_features/event/schema';
import { SendScheduledMeetinEmail } from '@/(server)/_shared/mailer/mailer';
import { getCurrentAuthenticated } from '@/(server)/_shared/utils/get-current-authenticated';
import { eventService } from '@/(server)/api/_index';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const sendInviteEmailSchema = z.object({
  emails: z.array(z.string().email()),
});

export async function POST(
  request: Request,
  { params }: { params: { slugOrId: string } }
) {
  const slugOrId = params.slugOrId;
  const cookieStore = cookies();
  const requestToken = cookieStore.get('token');
  const registeredParticipant: selectParticipant[] = [];

  if (!requestToken) {
    return NextResponse.json(
      {
        code: 401,
        message: 'Please check if token is provided in the cookie',
      },
      { status: 401 }
    );
  }

  const response = await getCurrentAuthenticated(requestToken?.value || '');
  const user = response.data ? response.data : null;

  if (!user) {
    return NextResponse.json(
      {
        code: 401,
        ok: false,
        message:
          'User not found, please check if token is provided in the cookie is valid',
      },
      { status: 401 }
    );
  }

  try {
    const event = await eventService.GetEventBySlugOrID(slugOrId, user.id);
    if (!event) {
      return NextResponse.json(
        {
          code: 404,
          ok: false,
          message: 'Event not found',
        },
        { status: 404 }
      );
    }

    if (event.status !== 'published') {
      return NextResponse.json(
        {
          code: 400,
          ok: false,
          message: 'Event is not published',
        },
        { status: 400 }
      );
    }

    try {
      const reqJSON = await request.json();

      const req = sendInviteEmailSchema.parse(reqJSON);
      req.emails.forEach(async (email) => {
        const participant = await eventService.InviteParticipant(event, email);
        if (participant) {
          registeredParticipant.push(participant);
        }
      });

      if (event.categoryID === 2) {
        // Send Email for the Host
        SendScheduledMeetinEmail(
          event,
          {
            name: user.name,
            email: user.email,
            pictureUrl: user.pictureUrl,
            id: user.id,
          },
          user.email,
          undefined,
          registeredParticipant
        );
      }
    } catch (e) {
      return NextResponse.json(
        {
          code: 400,
          ok: false,
          message: e,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        code: 200,
        ok: true,
        message: 'Emails sent successfully',
      },
      { status: 200 }
    );
  } catch (e) {
    console.log(e);
    return NextResponse.json(
      {
        code: 500,
        ok: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
