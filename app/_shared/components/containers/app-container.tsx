import NextUIProvider from '@/_shared/providers/nextui';
import AuthProvider from '@/_shared/providers/auth';
import type { AuthType } from '@/_shared/types/auth';
import SignInModal from '@/_shared/components/auth/sign-in-modal';

export default function AppContainer({
  children,
  currentUser,
}: {
  children: React.ReactNode;
  currentUser: AuthType.UserData | undefined;
}) {
  return (
    <>
      <NextUIProvider className="flex flex-1 flex-col">
        <AuthProvider value={{ currentUser: currentUser }}>
          {children}
          <SignInModal />
        </AuthProvider>
      </NextUIProvider>
    </>
  );
}
