import { headers } from 'next/headers';
import AppContainer from '@/_shared/components/containers/app-container';
import EventForm from '@/_features/event/components/event-form';
import { AuthType } from '@/_shared/types/auth';
import { InternalApiFetcher } from '@/_shared/utils/fetcher';
import { EventType } from '@/_shared/types/event';
import NotFound from '@/not-found';
import { getCookie } from '@/_shared/utils/get-cookie';

type PageProps = {
  params: {
    eventID: string;
  };
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

  return (
    <AppContainer user={user}>
      {data ? <EventForm data={data} /> : <NotFound />}
    </AppContainer>
  );
}
