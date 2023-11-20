import type { Metadata } from 'next';
import View from '@/_features/home/view';
import { headers } from 'next/headers';
import AppContainer from '@/_components/containers/app-container';
import type { UserType } from '@/_types/user';

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
      <View />
    </AppContainer>
  );
}
