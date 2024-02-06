import { headers } from 'next/headers';
import AppContainer from '@/_shared/components/containers/app-container';
import EventForm from '@/_features/event/components/event-form';
import { AuthType } from '@/_shared/types/auth';
import { InternalApiFetcher } from '@/_shared/utils/fetcher';
import { EventType } from '@/_shared/types/event';
import { notFound } from 'next/navigation';
import { getCookie } from '@/_shared/utils/get-cookie';
import { Metadata } from 'next';

type PageProps = {
  params: {
    eventID: string;
  };
};

export const metadata: Metadata = {
  title: 'Updating Your event — inLive Room',
};

export default async function Page({ params: { eventID } }: PageProps) {
  const headersList = headers();
  const userAuthHeader = headersList.get('user-auth');

  const user: AuthType.CurrentAuthData | null =
    typeof userAuthHeader === 'string'
      ? JSON.parse(userAuthHeader)
      : userAuthHeader;

  const cookie = await getCookie('token');

  const { data }: EventType.DetailEventResponse = await InternalApiFetcher.get(
    `/api/events/${eventID}`,
    {
      headers: {
        Cookie: `token=${cookie}`,
      },
    }
  );

  if (!data) {
    return notFound();
  }

  // Convert date strings to Date objects
  data.startTime = new Date(data.startTime);
  data.endTime = new Date(data.endTime);
  data.createdAt = new Date(data.createdAt);
  data.updatedAt = new Date(data.updatedAt);

  return (
    <AppContainer user={user}>
      <EventForm data={data} />
    </AppContainer>
  );
}
