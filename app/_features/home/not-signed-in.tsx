'use client';
import { Button } from '@nextui-org/react';
import JoinRoomField from '@/_features/home/join-room-field';

export default function NotSignedIn() {
  const openSignInModal = () => {
    document.dispatchEvent(new CustomEvent('open:sign-in-modal'));
  };

  return (
    <div className="flex w-full flex-col gap-10 py-10 md:flex-row md:py-20 lg:gap-20">
      <div className="flex-auto">
        <section className="md:max-w-xl">
          <h2 className="text-3xl font-semibold tracking-wide text-zinc-200 lg:text-4xl">
            Virtual room for your real-time collaboration
          </h2>
          <p className="mt-4 text-pretty text-base text-zinc-400 lg:text-lg">
            Connect with anyone, anywhere. Host or join in seconds. It&apos;s
            that simple! Experience real-time messaging, video, and audio for
            seamless collaboration, all within open-source virtual rooms.
          </p>
          <div className="mt-8">
            <Button
              className="h-auto min-h-0 min-w-0 rounded-lg bg-red-700 px-6 py-2.5 text-sm font-medium text-zinc-100 antialiased hover:bg-red-600 active:bg-red-500"
              onPress={openSignInModal}
            >
              Sign in to try inLive Room
            </Button>
          </div>
        </section>
      </div>
      <div className="flex flex-1 justify-center md:justify-end">
        <div className="w-[400px] md:w-[360px] lg:w-[400px]">
          <div className="rounded-2xl border border-zinc-950 bg-zinc-950/25 p-6 lg:p-8">
            <p className="mb-4 text-base font-medium text-zinc-400">
              Got a room code to join?
            </p>
            <JoinRoomField />
          </div>
        </div>
      </div>
    </div>
  );
}
