import AppContainer from '@/_shared/components/containers/app-container';
import HTTPError from '@/_shared/components/errors/http-error';
import { getClientAuth } from '@/_shared/utils/get-client-auth';

export default async function NotFound() {
  const currentAuth = await getClientAuth();
  const user = currentAuth.data ? currentAuth.data : undefined;

  return (
    <AppContainer user={user}>
      <HTTPError
        code={404}
        title="Page Not Found"
        description="There is nothing to see on this page"
      />
    </AppContainer>
  );
}
