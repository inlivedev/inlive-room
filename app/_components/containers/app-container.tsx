import NextUIProvider from '@/_providers/nextui';
import AuthProvider from '@/_providers/auth';
import type { UserType } from '@/_types/user';
import SignInModal from '@/_components/auth/sign-in-modal';

export default function AppContainer({
  children,
  user,
}: {
  children: React.ReactNode;
  user: UserType.AuthUserData | null;
}) {
  return (
    <>
      <NextUIProvider>
        <AuthProvider value={{ user: user }}>
          {children}
          <SignInModal />
        </AuthProvider>
      </NextUIProvider>
    </>
  );
}
