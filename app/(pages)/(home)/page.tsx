import type { Metadata } from 'next';
import { headers } from 'next/headers';
import Home from '@/_features/home/layout';
import { InternalApiFetcher } from '@/_shared/utils/fetcher';
import type { AuthType } from '@/_shared/types/auth';

export const metadata: Metadata = {
  title: 'inLive Room',
  description: 'Conference room for real-time video and audio calls',
};

export default async function Page() {
  const currentAuth: AuthType.CurrentAuthInternalResponse =
    await InternalApiFetcher.get('/api/auth/current', {
      headers: headers(),
    });

  const currentUser = currentAuth.data ? currentAuth.data : null;

  return <Home currentUser={currentUser} />;
}
