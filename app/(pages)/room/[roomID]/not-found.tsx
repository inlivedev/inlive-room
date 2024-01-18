import type { Metadata } from 'next';
import AppContainer from '@/_shared/components/containers/app-container';
import HTTPError from '@/_shared/components/errors/http-error';
import { headers } from 'next/headers';
import type { AuthType } from '@/_shared/types/auth';

export const metadata: Metadata = {
  title: 'Room Not Found',
  description: 'There is nothing to see on this page',
};

export default async function NotFound() {
  const headersList = headers();
  const userAuthHeader = headersList.get('user-auth');
  const user: AuthType.CurrentAuthData | null =
    typeof userAuthHeader === 'string'
      ? JSON.parse(userAuthHeader)
      : userAuthHeader;

  return (
    <AppContainer user={user}>
      <HTTPError
        code={404}
        title="Room Not Found"
        description="There is nothing to see on this page"
      />
    </AppContainer>
  );
}
