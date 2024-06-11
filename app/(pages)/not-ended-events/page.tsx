import { AuthType } from '@/_shared/types/auth';
import { EventType } from '@/_shared/types/event';
import { InternalApiFetcher } from '@/_shared/utils/fetcher';
import { headers, cookies } from 'next/headers';
import EventList from '@/_features/event/components/event-list';
import AppContainer from '@/_shared/components/containers/app-container';
import { NotEndedEventList } from '@/_features/event/components/not-ended-event-list';

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

  const token = cookies().get('token')?.value ?? '';

  const page = searchParams['page'] ? parseInt(searchParams['page']) : 1;
  const limit = searchParams['limit'] ? parseInt(searchParams['limit']) : 2;

  const PathParams = new URL('http://test.com/api/events/not-ended');

  PathParams.searchParams.append('page', page.toString());
  PathParams.searchParams.append('limit', limit.toString());
  const Path = '/' + PathParams.pathname + PathParams.search;
  const eventResponse: EventType.ListEventsResponse =
    await InternalApiFetcher.get(Path, {
      headers: {
        Cookie: `token=${token}`,
      },
    });

  const pageMeta = eventResponse.meta;
  const events = eventResponse.data || [];

  return (
    <AppContainer user={user}>
      <NotEndedEventList events={events} pageMeta={pageMeta} />
    </AppContainer>
  );
}
