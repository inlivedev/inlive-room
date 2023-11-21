import type { Metadata } from 'next';
import Home from '@/_features/home/home';
import { headers } from 'next/headers';
import AppContainer from '@/_shared/components/containers/app-container';
import type { UserType } from '@/_shared/types/user';

export const metadata: Metadata = {
  title: 'inLive Room',
  description: 'Conference room for real-time video and audio calls',
};

export default async function Page() {
  const headersList = headers();
  const userAuthHeader = headersList.get('user-auth');
  const user: UserType.AuthUserData | null =
    typeof userAuthHeader === 'string'
      ? JSON.parse(userAuthHeader)
      : userAuthHeader;

  return (
    <AppContainer user={user}>
      <Home />
    </AppContainer>
  );
}
