import type { Metadata } from 'next';
import { cookies, headers } from 'next/headers';
import AppContainer from '@/_shared/components/containers/app-container';
import EventForm from '@/_features/event/components/event-form';
import type { AuthType } from '@/_shared/types/auth';
import { EventType } from '@/_shared/types/event';
import { InternalApiFetcher } from '@/_shared/utils/fetcher';
import { whitelistFeature } from '@/_shared/utils/flag';

const title = `Let's Create Your Event — inLive Event`;
const description = `Enjoy features like analytics, hassle-free event registration, and automatic virtual room integration all conveniently accessible within a single application.`;
const ogImage = '/images/webinar/og-image-webinar.png';

export const metadata: Metadata = {
  title: title,
  openGraph: {
    title: title,
    description: description,
    url: `/events/create`,
    images: [ogImage],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: title,
    description: description,
    images: [ogImage],
  },
};

export default async function Page() {
  const headersList = headers();
  const userAuthHeader = headersList.get('user-auth');

  const user: AuthType.CurrentAuthData | null =
    typeof userAuthHeader === 'string'
      ? JSON.parse(userAuthHeader)
      : userAuthHeader;

  let isLimitReached = false;

  if (user) {
    const token = cookies().get('token')?.value ?? '';

    if (!whitelistFeature.includes('event') === true) {
      const eventCreateLimit: EventType.CreateLimit =
        await InternalApiFetcher.get(`/api/events/can-create`, {
          headers: {
            Cookie: `token=${token}`,
          },
        });

      if (eventCreateLimit?.code === 403) {
        isLimitReached = true;
      }
    }
  }

  return (
    <AppContainer user={user}>
      <EventForm limitPublish={isLimitReached} />
    </AppContainer>
  );
}
