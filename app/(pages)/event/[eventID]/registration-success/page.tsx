import type { Metadata } from 'next';
import { headers } from 'next/headers';
import AppContainer from '@/_shared/components/containers/app-container';
import EventRegistrationSuccess from '@/_features/event/components/event-registration-success';
import type { UserType } from '@/_shared/types/user';

type PageProps = {
  params: {
    eventID: string;
  };
};

export const generateMetadata = (): Metadata => {
  return {
    title: `Successfully registered to the event`,
  };
};

export default async function Page({ params: { eventID } }: PageProps) {
  const headersList = headers();
  const userAuthHeader = headersList.get('user-auth');

  const userAuth: UserType.AuthUserData | null =
    typeof userAuthHeader === 'string'
      ? JSON.parse(userAuthHeader)
      : userAuthHeader;

  return (
    <AppContainer user={userAuth}>
      <EventRegistrationSuccess />
    </AppContainer>
  );
}
