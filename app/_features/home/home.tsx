'use client';
import Header from '@/_shared/components/header/header';
import Footer from '@/_shared/components/footer/footer';
import SignedIn from '@/_features/home/signed-in';
import NotSignedIn from '@/_features/home/not-signed-in';
import { useAuthContext } from '@/_shared/contexts/auth';

export default function View() {
  const { user } = useAuthContext();

  return (
    <div className="bg-zinc-900 text-zinc-200">
      <div className="min-viewport-height mx-auto flex h-full w-full max-w-7xl flex-1 flex-col px-4">
        <Header logoText="inLive Room" logoHref="/" />
        <main className="flex flex-1 flex-col justify-center">
          {user ? <SignedIn /> : <NotSignedIn />}
        </main>
        <Footer />
      </div>
    </div>
  );
}
