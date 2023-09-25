'use client';

import AuthProvider from '@/_shared/providers/auth';
import Header from '@/_shared/components/header/header';
import CreateRoom from '@/_features/home/create-room/create-room';
import JoinRoom from '@/_features/home/join-room/join-room';
import Footer from '@/_shared/components/footer/footer';
import type { AuthType } from '@/_shared/types/auth';

export default function View({
  currentUser,
}: {
  currentUser: AuthType.UserData | undefined;
}) {
  return (
    <AuthProvider value={{ currentUser: currentUser }}>
      <div className="flex flex-1 flex-col bg-zinc-900 text-zinc-200">
        <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-4">
          <Header />
          <main className="mx-auto flex flex-1 flex-col justify-center">
            <div className="flex w-full flex-col gap-20 lg:flex-row">
              <div>
                <CreateRoom />
              </div>
              <div className="flex-1">
                <JoinRoom />
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </div>
    </AuthProvider>
  );
}
