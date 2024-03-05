import type { Metadata } from 'next';
import { headers } from 'next/headers';
import AppContainer from '@/_shared/components/containers/app-container';
import EventForm from '@/_features/event/components/event-form';
import type { AuthType } from '@/_shared/types/auth';

export const generateMetadata = (): Metadata => {
  return {
    title: `Let's Create Your Event — inLive Room`,
  };
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
      <EventForm />
    </AppContainer>
  );
}
