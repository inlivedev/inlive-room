import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import Home from '@/_features/home/view';
import { InternalApiFetcher } from '@/_shared/utils/fetcher';
import type { AuthType } from '@/_shared/types/auth';

export const metadata: Metadata = {
  title: 'inLive Room',
  description: 'Conference room for real-time video and audio calls',
};

export default async function Page() {
  const cookieStore = cookies();

  const currentAuth: AuthType.CurrentAuthInternalResponse =
    await InternalApiFetcher.get('/api/auth/current', {
      headers: {
        cookie: cookieStore.toString(),
      },
      cache: 'no-store',
    });

  const currentUser = currentAuth.data ? currentAuth.data : undefined;

  return <Home currentUser={currentUser} />;
}
