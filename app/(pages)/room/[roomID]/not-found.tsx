import AppContainer from '@/_shared/components/containers/app-container';
import HTTPError from '@/_shared/components/errors/http-error';
import { headers } from 'next/headers';
import type { UserType } from '@/_shared/types/user';

export default async function NotFound() {
  const headersList = headers();
  const userAuthHeader = headersList.get('user-auth');
  const user: UserType.AuthUserData | null = JSON.parse(userAuthHeader || '');

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
