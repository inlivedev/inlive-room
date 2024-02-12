import { headers } from 'next/headers';
import AppContainer from '@/_shared/components/containers/app-container';
import EventForm from '@/_features/event/components/event-form';
import { AuthType } from '@/_shared/types/auth';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { eventService } from '@/(server)/api/_index';
import HTTPError from '@/_shared/components/errors/http-error';

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
      description: `You don't have permission to access this page. Please sign in with different account.`,
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
      <HTTPError
        title="Login Required"
        description="You need to be logged in to access this page"
      />
    );
  }

  const event = await eventService.getEventBySlugOrID(eventID, user?.id);

  if (!event) {
    return notFound();
  }

  if (event.createdBy !== user.id) {
    return (
      <HTTPError
        title="You are not authorized"
        description="You don't have permission to access this page. Please sign in with different account."
      />
    );
  }

  return (
    <AppContainer user={user}>
      <EventForm data={event} />
    </AppContainer>
  );
}
