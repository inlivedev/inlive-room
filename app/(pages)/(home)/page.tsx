import Home from '@/_features/home/home';
import { cookies, headers } from 'next/headers';
import AppContainer from '@/_shared/components/containers/app-container';
import type { AuthType } from '@/_shared/types/auth';
import { UpcomingEvent } from '@/(server)/_features/event/repository';
import { eventRepo } from '@/(server)/api/_index';

export default async function Page() {
  const headersList = headers();
  const userAuthHeader = headersList.get('user-auth');
  const user: AuthType.CurrentAuthData | null =
    typeof userAuthHeader === 'string'
      ? JSON.parse(userAuthHeader)
      : userAuthHeader;

  const now = new Date();

  const token = cookies().get('token')?.value ?? '';

  const upcomingEvents: UpcomingEvent[] = [];

  const persistentData = process.env.NEXT_PUBLIC_PERSISTENT_DATA === 'true';

  if (token && user && persistentData) {
    const events = await eventRepo.getUpcomingEvents(user.id);
    upcomingEvents.push(...events);
  }

  return (
    <AppContainer user={user}>
      <Home events={upcomingEvents} />
    </AppContainer>
  );
}
