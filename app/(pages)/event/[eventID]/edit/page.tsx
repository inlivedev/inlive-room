import { headers } from 'next/headers';
import AppContainer from '@/_shared/components/containers/app-container';
import EventForm from '@/_features/event/components/event-form';
import { AuthType } from '@/_shared/types/auth';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { eventService } from '@/(server)/api/_index';
import HTTPError from '@/_shared/components/errors/http-error';
import { whitelistFeature } from '@/_shared/utils/flag';

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

  const eligibleForEvent =
    whitelistFeature.includes('event') ||
    !!user?.whitelistFeature.includes('event');

  if (!eligibleForEvent) {
    return {
      title: `You are not eligible to see this page — inLive Room`,
      description: 'Only early-access users can access this page.',
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

  const eligibleForEvent =
    whitelistFeature.includes('event') ||
    !!user?.whitelistFeature.includes('event');

  if (!eligibleForEvent) {
    return (
      <AppContainer user={user}>
        <HTTPError
          title="You are not eligible to see this page"
          description="Only early-access users can access this page."
        />
      </AppContainer>
    );
  }

  return (
    <AppContainer user={user}>
      <EventForm data={event} />
    </AppContainer>
  );
}
