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

  const registereesResponse: EventType.GetRegistereeResponse =
    await InternalApiFetcher.get(`/api/events/${eventID}/details/registeree`, {
      headers: {
        Cookie: `token=${token}`,
      },
    });

  const registerees = registereesResponse.data || [];

  return (
    <AppContainer user={user}>
      {event.status === 'draft' ? (
        <EventDetail event={event} status="draft" />
      ) : (
        <EventDetailDashboard event={event} registerees={registerees} />
      )}
    </AppContainer>
  );
}
