import type { Metadata } from 'next';
import Home from '@/_features/home/home';
import { headers } from 'next/headers';
import AppContainer from '@/_shared/components/containers/app-container';
import type { AuthType } from '@/_shared/types/auth';

export const metadata: Metadata = {
  title: 'inLive Room',
  description: 'Conference room for real-time video and audio calls',
};

export default async function Page() {
  const headersList = headers();
  const userAuthHeader = headersList.get('user-auth');
  const user: AuthType.CurrentAuthInternalData | null =
    typeof userAuthHeader === 'string'
      ? JSON.parse(userAuthHeader)
      : userAuthHeader;

  return (
    <AppContainer user={user}>
      <Home />
    </AppContainer>
  );
}
