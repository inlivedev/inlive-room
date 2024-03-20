import type { Metadata } from 'next';
import { cookies, headers } from 'next/headers';
import { notFound } from 'next/navigation';
import AppContainer from '@/_shared/components/containers/app-container';
import EventDetail from '@/_features/event/components/event-detail';
import EventDetailDashboard from '@/_features/event/components/event-detail-dashboard';
import HTTPError from '@/_shared/components/errors/http-error';
import { eventService } from '@/(server)/api/_index';
import { InternalApiFetcher } from '@/_shared/utils/fetcher';
import type { AuthType } from '@/_shared/types/auth';
import type { EventType } from '@/_shared/types/event';

type PageProps = {
  params: {
    eventID: string;
  };
};

export const generateMetadata = async ({
  params: { eventID },
}: PageProps): Promise<Metadata> => {
  const headersList = headers();
  const userAuthHeader = headersList.get('user-auth');

  const user: AuthType.CurrentAuthData | null =
    typeof userAuthHeader === 'string'
      ? JSON.parse(userAuthHeader)
      : userAuthHeader;

  if (!user || !user.id) {
    return {
      title: `Login Required — inLive Room`,
      description: 'You need to be logged in to access this page',
    };
  }

  const event = await eventService.getEventBySlugOrID(eventID, user.id);

  if (!event || !event.id) {
    return {
      title: 'Page Not Found',
      description: 'There is nothing to see on this page',
    };
  }

  if (event.createdBy !== user.id) {
    return {
      title: `You Are Not Authorized — inLive Room`,
      description: `You don't have permission to access this page. Please use an account which has access to this page.`,
    };
  }

  return {
    title: `Webinar — ${event.name} — inLive Room`,
    description: `Detail of ${event.name}`,
  };
};

export default async function Page({ params: { eventID } }: PageProps) {
  const headersList = headers();
  const userAuthHeader = headersList.get('user-auth');

  const user: AuthType.CurrentAuthData | null =
    typeof userAuthHeader === 'string'
      ? JSON.parse(userAuthHeader)
      : userAuthHeader;

  if (!user || !user.id) {
    return (
      <AppContainer user={user}>
        <HTTPError
          code={401}
          title="Login Required"
          description="You need to be logged in to access this page"
        />
      </AppContainer>
    );
  }

  const event = await eventService.getEventBySlugOrID(eventID, user.id);

  if (!event) {
    return notFound();
  }

  const isHost = user.id === event.createdBy;

  if (!isHost) {
    return (
      <AppContainer user={user}>
        <HTTPError
          code={403}
          title="You are not authorized"
          description="You don't have permission to access this page. Please use an account which has access to this page."
        />
      </AppContainer>
    );
  }

  const token = cookies().get('token')?.value ?? '';

  const registereesResponse: EventType.RegistereeParticipantResponse =
    await InternalApiFetcher.get(`/api/events/${eventID}/details/registeree`, {
      headers: {
        Cookie: `token=${token}`,
      },
    });

  const registerees =
    registereesResponse.data.map((registeree) => {
      const name = `${registeree.firstName} ${registeree.lastName}`;

      const registeredDate = registeree.createdAt.toLocaleDateString('en-GB', {
        month: 'long',
        day: '2-digit',
        year: 'numeric',
      });

      const registeredTime = registeree.createdAt.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });

      const registeredAt = `${registeredDate}, ${registeredTime}`;

      return {
        id: registeree.id,
        name: name,
        email: registeree.email,
        registeredAt: registeredAt,
      };
    }) || [];

  const eventStartTime = new Date(event.startTime);
  const eventEndTime = new Date(event.endTime);

  const startDateWithoutYear = eventStartTime.toLocaleString('en-GB', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const startDateWithYear = eventStartTime.toLocaleString('en-GB', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const startTime = eventStartTime.toLocaleString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const endTime = eventEndTime.toLocaleString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const createdDate = new Date(event.createdAt).toLocaleDateString('en-GB', {
    month: 'long',
    day: '2-digit',
    year: 'numeric',
  });

  return (
    <AppContainer user={user}>
      {event.status === 'draft' ? (
        <EventDetail
          event={event}
          status="draft"
          startDateWithoutYear={startDateWithoutYear}
          startDateWithYear={startDateWithYear}
          startTime={startTime}
          endTime={endTime}
        />
      ) : (
        <EventDetailDashboard
          event={event}
          registerees={registerees}
          startDateWithYear={startDateWithYear}
          startTime={startTime}
          createdDate={createdDate}
        />
      )}
    </AppContainer>
  );
}
