import type { Metadata } from 'next';
import { cookies, headers } from 'next/headers';
import AppContainer from '@/_shared/components/containers/app-container';
import type { AuthType } from '@/_shared/types/auth';
import HTTPError from '@/_shared/components/errors/http-error';
import { whitelistFeature } from '@/_shared/utils/flag';
import PastEvents from '@/_features/event/components/past-events';
import { InternalApiFetcher } from '@/_shared/utils/fetcher';
import { EventType } from '@/_shared/types/event';

export const generateMetadata = (): Metadata => {
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
    title: `Past Events — inLive Room`,
  };
};

export default async function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const headersList = headers();
  const userAuthHeader = headersList.get('user-auth');

  const user: AuthType.CurrentAuthData | null =
    typeof userAuthHeader === 'string'
      ? JSON.parse(userAuthHeader)
      : userAuthHeader;

  if (!user) {
    return (
      <HTTPError
        title="Login Required"
        description="You need to be logged in to access this page"
      />
    );
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

  const page = searchParams['page'] ? parseInt(searchParams['page']) : 1;
  const limit = searchParams['limit'] ? parseInt(searchParams['limit']) : 10;
  const token = cookies().get('token')?.value ?? '';
  const today = new Date();

  today.setUTCMilliseconds(0);
  today.setUTCSeconds(0);

  const eventResponse: EventType.ListEventsResponse =
    await InternalApiFetcher.get(
      `/api/events?page=${page}&limit=${limit}&is_before${today.toISOString()}&is_published=true`,
      {
        headers: {
          Cookie: `token=${token}`,
        },
      }
    );

  const eventStats = await getEventStats(eventResponse.data, token);

  return (
    <AppContainer user={user}>
      <PastEvents events={eventResponse.data} eventsStat={eventStats} />
    </AppContainer>
  );
}

const getEventStats = async (events: EventType.Event[], token: string) => {
  const stats = await Promise.all(
    events.map(async (event) => {
      const eventStat: EventType.Stat = await InternalApiFetcher.get(
        `/api/events/${event.id}/stat`,
        { headers: { Cookie: `token=${token}` } }
      );

      return eventStat;
    })
  );

  return stats;
};
