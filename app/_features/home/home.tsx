'use client';
import Header from '@/_shared/components/header/header';
import Footer from '@/_shared/components/footer/footer';
import SignedIn from '@/_features/home/signed-in';
import NotSignedIn from '@/_features/home/not-signed-in';
import { useAuthContext } from '@/_shared/contexts/auth';
import { UpcomingEvent } from '@/(server)/_features/event/repository';

export default function View({ events }: { events: UpcomingEvent[] }) {
  const { user } = useAuthContext();

  return (
    <div className="bg-zinc-950">
      <div className="min-viewport-height mx-auto flex h-full w-full max-w-7xl flex-1 flex-col px-4">
        <Header logoText="inLive Room" logoHref="/" />
        <main className="grid flex-1 grid-cols-1">
          {user ? <SignedIn user={user} events={events} /> : <NotSignedIn />}
        </main>
        <Footer />
      </div>
    </div>
  );
}
