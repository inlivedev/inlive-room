import NextUIProvider from '@/_shared/providers/nextui';
import { AuthProvider } from '@/_shared/contexts/auth';
import type { AuthType } from '@/_shared/types/auth';
import SignInModal from '@/_shared/components/auth/sign-in-modal';

export default function AppContainer({
  children,
  user,
}: {
  children: React.ReactNode;
  user: AuthType.CurrentAuthInternalData | null;
}) {
  return (
    <>
      <NextUIProvider>
        <AuthProvider
          user={
            user
              ? {
                  id: user.id,
                  email: user.email,
                  name: user.name,
                  pictureUrl: user.pictureUrl,
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  webinarEnabled: user?.webinar_enabled === true,
                }
              : user
          }
        >
          {children}
          <SignInModal />
        </AuthProvider>
      </NextUIProvider>
    </>
  );
}
