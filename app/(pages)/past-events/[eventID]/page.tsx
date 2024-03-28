import { eventService } from '@/(server)/api/_index';
import EventPastDashboard from '@/_features/event/components/event-past-dashboard';
import AppContainer from '@/_shared/components/containers/app-container';
import HTTPError from '@/_shared/components/errors/http-error';
import { AuthType } from '@/_shared/types/auth';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';

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

  if (!user || !user.id) {
    return (
      <AppContainer user={user}>
        <HTTPError
          code={401}
          title="Login Required"
          description="You need to be logged in to access this page"
        />
      </AppContainer>
    );
  }

  const event = await eventService.getEventBySlugOrID(eventID, user.id);

  if (!event) {
    return notFound();
  }

  const isHost = user.id === event.createdBy;

  if (!isHost) {
    return (
      <AppContainer user={user}>
        <HTTPError
          code={403}
          title="You are not authorized"
          description="You don't have permission to access this page. Please use an account which has access to this page."
        />
      </AppContainer>
    );
  }

  return <EventPastDashboard event={event} />;
}
