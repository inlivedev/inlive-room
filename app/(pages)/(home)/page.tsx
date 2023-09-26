import type { Metadata } from 'next';
import View from '@/_features/home/view';
import { getClientAuth } from '@/_shared/utils/get-client-auth';
import AppContainer from '@/_shared/components/containers/app-container';

export const metadata: Metadata = {
  title: 'inLive Room',
  description: 'Conference room for real-time video and audio calls',
};

export default async function Page() {
  const currentAuth = await getClientAuth();
  const currentUser = currentAuth.data ? currentAuth.data : undefined;

  return (
    <AppContainer currentUser={currentUser}>
      <View />
    </AppContainer>
  );
}
