import type { Metadata } from 'next';
import { cookies, headers } from 'next/headers';
import AppContainer from '@/_shared/components/containers/app-container';
import type { AuthType } from '@/_shared/types/auth';
import EventList from '@/_features/event/components/event-list';
import type { EventType } from '@/_shared/types/event';
import { InternalApiFetcher } from '@/_shared/utils/fetcher';
import { whitelistFeature } from '@/_shared/utils/flag';

export const generateMetadata = (): Metadata => {
  return {
    title: `My Events — inLive Room`,
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

  const page = searchParams['page'] ? parseInt(searchParams['page']) : 1;
  const limit = searchParams['limit'] ? parseInt(searchParams['limit']) : 10;

  const token = cookies().get('token')?.value ?? '';

  const eventResponse: EventType.ListEventsResponse =
    await InternalApiFetcher.get(`/api/events?page=${page}&limit=${limit}`, {
      headers: {
        Cookie: `token=${token}`,
      },
    });

  let createEventLimit: EventType.CreateLimit | undefined = undefined;

  if (!whitelistFeature.includes('event') === true) {
    createEventLimit = await InternalApiFetcher.get(`/api/events/can-create`, {
      headers: {
        Cookie: `token=${token}`,
      },
    });
  }

  const events = eventResponse.data || [];
  const pageMeta = eventResponse.meta;

  let validPagination = false;
  if (page <= pageMeta.total_page) {
    validPagination = true;
  }

  return (
    <AppContainer user={user}>
      <EventList
        events={events}
        user={user}
        pageMeta={pageMeta}
        validPagination={validPagination}
        createEventLimit={createEventLimit}
      />
    </AppContainer>
  );
}
