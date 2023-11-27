import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import AppContainer from '@/_shared/components/containers/app-container';
import EventDetail from '@/_features/event/components/event-detail';
import { InternalApiFetcher } from '@/_shared/utils/fetcher';
import type { UserType } from '@/_shared/types/user';
import type { EventType } from '@/_shared/types/event';

type PageProps = {
  params: {
    eventID: string;
  };
};

export const generateMetadata = ({ params }: PageProps): Metadata => {
  return {
    title: `Detail Event`,
  };
};

export default async function Page({ params: { eventID } }: PageProps) {
  const headersList = headers();
  const userAuthHeader = headersList.get('user-auth');

  const userAuth: UserType.AuthUserData | null =
    typeof userAuthHeader === 'string'
      ? JSON.parse(userAuthHeader)
      : userAuthHeader;

  const { data: eventData }: EventType.DetailEventResponse =
    await InternalApiFetcher.get(`/api/events/${eventID}`);

  if (!eventData || !eventData.id) {
    notFound();
  }

  const descriptionMarkup = {
    __html: eventData.description || '',
  };

  return (
    <AppContainer user={userAuth}>
      <EventDetail
        title={eventData.name}
        descriptionMarkup={descriptionMarkup}
        slug={eventData.slug}
        host={eventData.host}
        startTime={eventData.startTime}
      />
    </AppContainer>
  );
}
