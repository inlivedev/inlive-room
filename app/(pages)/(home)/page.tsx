import type { Metadata } from 'next';
import Home from '@/_features/home/view';
import { getClientAuth } from '@/_shared/utils/get-client-auth';

export const metadata: Metadata = {
  title: 'inLive Room',
  description: 'Conference room for real-time video and audio calls',
};

export default async function Page() {
  const currentAuth = await getClientAuth();
  const currentUser = currentAuth.data ? currentAuth.data : undefined;

  return <Home currentUser={currentUser} />;
}
