import type { Metadata } from 'next';
import { headers } from 'next/headers';
import AppContainer from '@/_shared/components/containers/app-container';
import { AuthType } from '@/_shared/types/auth';
import HTTPError from '@/_shared/components/errors/http-error';
import EventList from '@/_features/event/components/event-list';

export const metadata: Metadata = {
  title: 'My Events — inLive Room',
};

export default async function Page() {
  const headersList = headers();
  const userAuthHeader = headersList.get('user-auth');

  const user: AuthType.CurrentAuthData | null =
    typeof userAuthHeader === 'string'
      ? JSON.parse(userAuthHeader)
      : userAuthHeader;

  return (
    <AppContainer user={user}>
      {user ? (
        <EventList />
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
