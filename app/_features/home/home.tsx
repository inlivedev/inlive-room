'use client';
import Header from '@/_shared/components/header/header';
import CreateRoom from '@/_features/home/create-room';
import JoinRoom from '@/_features/home/join-room';
import Footer from '@/_shared/components/footer/footer';
import MeetingList from '../meeting/meeting-list';

export default function View() {
  return (
    <div className="bg-zinc-900 text-zinc-200">
      <div className="min-viewport-height mx-auto flex h-full w-full max-w-7xl flex-1 flex-col px-4">
        <Header logoText="inLive Room" logoHref="/" />
        <main className="flex flex-1 flex-col justify-center">
          <div className="flex w-full flex-col gap-10 py-10 md:flex-row md:py-20 lg:gap-20">
            <div className="flex flex-auto flex-col gap-8">
              <Title />
              <div className="flex flex-row gap-2">
                <CreateRoom />
                <JoinRoom />
              </div>
            </div>
            <div className="flex flex-1 justify-center md:justify-end">
              <div className="w-[400px] md:w-[360px] lg:w-[400px]">
                <MeetingList />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}

function Title() {
  return (
    <div>
      <h2 className="text-center text-3xl font-semibold tracking-wide text-zinc-200 sm:text-left lg:text-4xl">
        Virtual room for your real-time collaboration
      </h2>
      <p className="mt-4 text-pretty text-center text-base text-zinc-400 sm:text-left lg:text-lg">
        Connect with anyone, anywhere. Host or join in seconds. It&apos;s that
        simple! Experience real-time messaging, video, and audio for seamless
        collaboration, all within open-source virtual rooms.
      </p>
    </div>
  );
}
