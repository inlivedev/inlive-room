import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import AppContainer from '@/_shared/components/containers/app-container';
import EventRegistrationSuccess from '@/_features/event/components/event-registration-success';
import { InternalApiFetcher } from '@/_shared/utils/fetcher';
import type { UserType } from '@/_shared/types/user';
import type { EventType } from '@/_shared/types/event';

type PageProps = {
  params: {
    eventID: string;
  };
  searchParams: { [key: string]: string };
};

export const generateMetadata = (): Metadata => {
  return {
    title: `Successfully registered to the event`,
  };
};

export default async function Page({
  params: { eventID },
  searchParams,
}: PageProps) {
  const headersList = headers();
  const userAuthHeader = headersList.get('user-auth');

  const userAuth: UserType.AuthUserData | null =
    typeof userAuthHeader === 'string'
      ? JSON.parse(userAuthHeader)
      : userAuthHeader;

  const { data: eventData }: EventType.DetailEventResponse =
    await InternalApiFetcher.get(`/api/events/${eventID}`);

  const participantName = searchParams.name;

  if (!eventData || !eventData.id || !participantName) {
    notFound();
  }

  return (
    <AppContainer user={userAuth}>
      <EventRegistrationSuccess
        participantName={participantName}
        title={eventData.name}
        startTime={eventData.startTime}
        slug={eventData.slug}
      />
    </AppContainer>
  );
}
