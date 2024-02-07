import type { Metadata } from 'next';
import { headers } from 'next/headers';
import AppContainer from '@/_shared/components/containers/app-container';
import EventForm from '@/_features/event/components/event-form';
import { AuthType } from '@/_shared/types/auth';
import HTTPError from '@/_shared/components/errors/http-error';
import { whitelistFeature } from '@/_shared/utils/flag';

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
    title: `Create Your Event — inLive Room`,
  };
};

export default async function Page() {
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

  return (
    <AppContainer user={user}>
      <EventForm />
    </AppContainer>
  );
}
