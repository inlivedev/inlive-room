import type { Metadata } from 'next';
import { headers } from 'next/headers';
import AppContainer from '@/_shared/components/containers/app-container';
import EventForm from '@/_features/event/components/event-form';
import { AuthType } from '@/_shared/types/auth';
import HTTPError from '@/_shared/components/errors/http-error';

export const metadata: Metadata = {
  title: 'Create Your Event — inLive Room',
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
        <EventForm />
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
