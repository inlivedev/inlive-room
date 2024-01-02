import { UserType } from '@/_shared/types/user';
import { headers } from 'next/headers';
import AppContainer from '@/_shared/components/containers/app-container';
import EventForm from '@/_features/event/components/event-form';

export default async function Page() {
  const headersList = headers();
  const userAuthHeader = headersList.get('user-auth');

  const userAuth: UserType.AuthUserData | null =
    typeof userAuthHeader === 'string'
      ? JSON.parse(userAuthHeader)
      : userAuthHeader;

  return (
    <AppContainer user={userAuth}>
      <EventForm></EventForm>
    </AppContainer>
  );
}
