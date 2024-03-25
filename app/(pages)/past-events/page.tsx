import type { Metadata } from 'next';
import { cookies, headers } from 'next/headers';
import AppContainer from '@/_shared/components/containers/app-container';
import type { AuthType } from '@/_shared/types/auth';
import HTTPError from '@/_shared/components/errors/http-error';
import PastEvents from '@/_features/event/components/event-stat-list';
import { InternalApiFetcher } from '@/_shared/utils/fetcher';
import { EventType } from '@/_shared/types/event';

export const dynamic = 'force-dynamic';

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

  const page = searchParams['page'] ? parseInt(searchParams['page']) : 1;
  const limit = searchParams['limit'] ? parseInt(searchParams['limit']) : 10;
  const token = cookies().get('token')?.value ?? '';
  const today = new Date();

  today.setUTCMilliseconds(0);
  today.setUTCSeconds(0);

  const eventResponse: EventType.ListEventsResponse =
    await InternalApiFetcher.get(
      `/api/events?page=${page}&limit=${limit}&end_is_before=${today.toISOString()}&status[]=published`,
      {
        headers: {
          Cookie: `token=${token}`,
        },
      }
    );

  const events = eventResponse.data || [];
  const meta = eventResponse.meta;

  let validPagination = false;
  if (page <= meta.total_page) {
    validPagination = true;
  }

  return (
    <AppContainer user={user}>
      <PastEvents
        events={events}
        meta={meta}
        validPagination={validPagination}
      />
    </AppContainer>
  );
}
