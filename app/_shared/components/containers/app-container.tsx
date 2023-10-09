import NextUIProvider from '@/_shared/providers/nextui';
import AuthProvider from '@/_shared/providers/auth';
import type { UserType } from '@/_shared/types/user';
import SignInModal from '@/_shared/components/auth/sign-in-modal';

export default function AppContainer({
  children,
  user,
}: {
  children: React.ReactNode;
  user: UserType.AuthUserData | null;
}) {
  return (
    <>
      <NextUIProvider className="flex flex-1 flex-col">
        <AuthProvider value={{ user: user }}>
          {children}
          <SignInModal />
        </AuthProvider>
      </NextUIProvider>
    </>
  );
}
