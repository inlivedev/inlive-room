import { cookies, headers } from 'next/headers';
import AppContainer from '@/_shared/components/containers/app-container';
import EventForm from '@/_features/event/components/event-form';
import { AuthType } from '@/_shared/types/auth';
import { notFound, redirect } from 'next/navigation';
import { Metadata } from 'next';
import { eventService } from '@/(server)/api/_index';
import HTTPError from '@/_shared/components/errors/http-error';
import { whitelistFeature } from '@/_shared/utils/flag';
import { EventType } from '@/_shared/types/event';
import { InternalApiFetcher } from '@/_shared/utils/fetcher';

type PageProps = {
  params: {
    eventID: string;
  };
};

export const generateMetadata = async ({
  params: { eventID },
}: PageProps): Promise<Metadata | null> => {
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

  if (!event || !event.id) return null; // use not-found metadata

  if (event.createdBy !== user.id) {
    return {
      title: `You Are Not Authorized — inLive Room`,
      description: `You don't have permission to access this page. Please use an account which has access to this page.`,
    };
  }

  return {
    title: `Edit ${event.name} — inLive Room`,
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

  const event = await eventService.getEventBySlugOrID(eventID, user?.id);

  if (!event) {
    return notFound();
  }

  if (event.createdBy !== user.id) {
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

  let isLimitReached = false;
  const token = cookies().get('token')?.value ?? '';

  if (!whitelistFeature.includes('event') === true) {
    const eventCreateLimit: EventType.CreateLimit =
      await InternalApiFetcher.get(`/api/events/can-create`, {
        headers: {
          Cookie: `token=${token}`,
        },
      });

    if (eventCreateLimit?.code === 403) {
      isLimitReached = true;
    }

    if (event.status === 'published') {
      isLimitReached = false;
    }
  }

  if (event.status === 'cancelled') {
    redirect(`/event/${eventID}`);
  }

  return (
    <AppContainer user={user}>
      <EventForm data={event} limitPublish={isLimitReached} />
    </AppContainer>
  );
}
