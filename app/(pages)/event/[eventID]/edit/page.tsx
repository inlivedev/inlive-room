import { headers } from 'next/headers';
import AppContainer from '@/_shared/components/containers/app-container';
import EventForm from '@/_features/event/components/event-form';
import { AuthType } from '@/_shared/types/auth';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { eventService } from '@/(server)/api/_index';

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

  const event = await eventService.getEventBySlugOrID(eventID, user?.id);

  if (!event) {
    return notFound();
  }

  return (
    <AppContainer user={user}>
      <EventForm data={event} />
    </AppContainer>
  );
}
