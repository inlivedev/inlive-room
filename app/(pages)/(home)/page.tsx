import Home from '@/_features/home/home';
import { cookies, headers } from 'next/headers';
import AppContainer from '@/_shared/components/containers/app-container';
import type { AuthType } from '@/_shared/types/auth';
import { InternalApiFetcher } from '@/_shared/utils/fetcher';
import type { EventType } from '@/_shared/types/event';

export default async function Page() {
  const headersList = headers();
  const userAuthHeader = headersList.get('user-auth');
  const user: AuthType.CurrentAuthData | null =
    typeof userAuthHeader === 'string'
      ? JSON.parse(userAuthHeader)
      : userAuthHeader;

  const now = new Date();

  const token = cookies().get('token')?.value ?? '';

  let upcomingEvents: EventType.Event[] = [];

  if (token && user) {
    const listEventsResponse: EventType.ListEventsResponse =
      await InternalApiFetcher.get(
        `/api/events?&limit=${10}&end_is_after=${now.toISOString()}`,
        {
          headers: {
            Cookie: `token=${token}`,
          },
        }
      );

    upcomingEvents = listEventsResponse.data || [];
  }

  return (
    <AppContainer user={user}>
      <Home events={upcomingEvents} />
    </AppContainer>
  );
}
