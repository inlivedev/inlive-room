import type { Metadata } from 'next';
import { headers } from 'next/headers';
import AppContainer from '@/_shared/components/containers/app-container';
import { AuthType } from '@/_shared/types/auth';
import HTTPError from '@/_shared/components/errors/http-error';
import EventList from '@/_features/event/components/event-list';
import { EventType } from '@/_shared/types/event';
import { InternalApiFetcher } from '@/_shared/utils/fetcher';

export const metadata: Metadata = {
  title: 'My Events — inLive Room',
};

export default async function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const headersList = headers();
  const userAuthHeader = headersList.get('user-auth');

  const page = searchParams['page'] ? parseInt(searchParams['page']) : 1;
  const limit = searchParams['limit'] ? parseInt(searchParams['limit']) : 10;

  const user: AuthType.CurrentAuthData | null =
    typeof userAuthHeader === 'string'
      ? JSON.parse(userAuthHeader)
      : userAuthHeader;

  if (!user) {
    return (
      <HTTPError
        code={403}
        title="Login Required"
        description="You need to be logged in to access this page"
      />
    );
  }

  const eventResponse: EventType.ListEventsResponse =
    await InternalApiFetcher.get(
      `/api/events?created_by=${user.id}&page=${page}&limit=${limit}`
    );

  return (
    <AppContainer user={user}>
      {user ? (
        <EventList events={eventResponse.data} />
      ) : (
        <HTTPError
          code={403}
          title="Login Required"
          description="You need to be logged in to access this page"
        />
      )}
    </AppContainer>
  );
}
