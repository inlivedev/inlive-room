'use client';
import Header from '@/_shared/components/header/header';
import CreateRoom from '@/_features/home/create-room';
import JoinRoom from '@/_features/home/join-room';
import Footer from '@/_shared/components/footer/footer';

export default function View() {
  return (
    <div className="bg-zinc-900 text-zinc-200">
      <div className="min-viewport-height mx-auto flex h-full w-full max-w-7xl flex-1 flex-col px-4">
        <Header logoText="inLive Room" logoHref="/" />
        <main className="flex flex-1 flex-col justify-center">
          <div className="flex w-full flex-col gap-10 py-10 md:flex-row md:py-20 lg:gap-20">
            <div className="flex-auto">
              <CreateRoom />
            </div>
            <div className="flex flex-1 justify-center md:justify-end">
              <div className="w-[400px] md:w-[360px] lg:w-[400px]">
                <JoinRoom />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
