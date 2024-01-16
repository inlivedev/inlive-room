import NextUIProvider from '@/_shared/providers/nextui';
import { AuthProvider } from '@/_shared/contexts/auth';
import type { UserType } from '@/_shared/types/auth';
import SignInModal from '@/_shared/components/auth/sign-in-modal';
import { featureFlag } from '@/_shared/utils/feature-flag';

export default function AppContainer({
  children,
  user,
}: {
  children: React.ReactNode;
  user: UserType.AuthUserResponse | null;
}) {
  return (
    <>
      <NextUIProvider>
        <AuthProvider
          user={
            user
              ? {
                  userID: user.id,
                  email: user.email,
                  name: user.name,
                  pictureUrl: user.picture_url,
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
