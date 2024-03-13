'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@nextui-org/react';

export default function EventWelcomeModal() {
  const [step, setStep] = useState<number>(1);
  const setPrevious = () => setStep((prevState) => Math.max(prevState - 1, 1));
  const setNext = () => setStep((prevState) => Math.min(prevState + 1, 7));

  return (
    <>
      <div className="viewport-height fixed left-0 top-0 z-40 w-full bg-zinc-950 opacity-50"></div>
      <div className="viewport-height fixed left-0 top-0 z-50 flex w-full items-end justify-center sm:items-center">
        <div className="w-full max-w-none rounded-2xl bg-zinc-900 ring-1 ring-zinc-800 sm:max-w-sm lg:max-w-[640px]">
          {step === 1 ? (
            <WelcomeStep setNext={setNext} />
          ) : step === 2 ? (
            <Step2 setPrevious={setPrevious} setNext={setNext} />
          ) : step === 3 ? (
            <Step3 setPrevious={setPrevious} setNext={setNext} />
          ) : step === 4 ? (
            <Step4 setPrevious={setPrevious} setNext={setNext} />
          ) : step === 5 ? (
            <Step5 setPrevious={setPrevious} setNext={setNext} />
          ) : step === 6 ? (
            <Step6 setPrevious={setPrevious} setNext={setNext} />
          ) : step === 7 ? (
            <Step7 />
          ) : (
            <WelcomeStep setNext={setNext} />
          )}
        </div>
      </div>
    </>
  );
}

function WelcomeStep({ setNext }: { setNext: () => void }) {
  return (
    <div className="flex h-dvh max-h-[630px] flex-col overflow-y-auto overscroll-y-contain sm:max-h-[610px] lg:max-h-[562px]">
      <div className="flex-1">
        <div className="flex justify-center p-6">
          <Image
            width={0}
            height={0}
            src="/images/webinar/event-welcome-banner.png"
            alt="inLive Event Poster Illustration"
            className="h-auto w-full max-w-[320px]"
            priority={true}
            unoptimized
          ></Image>
        </div>
        <div className="p-6 text-sm text-zinc-300 md:px-6 md:py-2">
          <p>
            Hey there! <br />
            Welcome to your inLive Event dashboard.
          </p>
          <p className="mt-5 text-pretty">
            This is where you&apos;ll manage all your webinar events. We&apos;ve
            got some exciting features coming soon, like analytics and easy
            payment processing.
          </p>
          <p className="mt-5 text-pretty">
            Let&apos;s jump into a quick intro to get you started.
          </p>
        </div>
      </div>
      <div className="flex justify-end p-6">
        <Button
          className="min-w-0 rounded-lg bg-red-700 px-4 py-2 text-base font-medium antialiased hover:bg-red-600 active:bg-red-500"
          onClick={setNext}
        >
          Ok, next
        </Button>
      </div>
    </div>
  );
}

function Step2({
  setPrevious,
  setNext,
}: {
  setPrevious: () => void;
  setNext: () => void;
}) {
  return (
    <div className="flex h-dvh max-h-[630px] flex-col overflow-y-auto overscroll-y-contain sm:max-h-[610px] lg:max-h-[562px]">
      <div className="flex-1">
        <div className="flex justify-center p-6">
          <div className="flex justify-center lg:hidden">
            <Image
              width={0}
              height={0}
              src="/images/webinar/my-events-mobile.png"
              alt="A mobile view of my events page"
              className="h-auto w-full max-w-[320px]"
              loading="lazy"
              unoptimized
            />
          </div>
          <div className="hidden justify-center lg:flex">
            <Image
              width={0}
              height={0}
              src="/images/webinar/my-events-desktop.png"
              alt="A desktop view of my events page"
              className="h-auto w-full"
              loading="lazy"
              unoptimized
            />
          </div>
        </div>
        <p className="text-pretty px-6 py-2 text-sm text-zinc-300">
          Start your webinar in minutes! Just simple steps to publish your first
          event. Super easy.
        </p>
      </div>

      <div className="flex justify-between gap-3 p-6">
        <Button
          className="min-w-0 rounded-lg bg-zinc-800 px-4 py-2 text-base font-medium antialiased hover:bg-zinc-700 active:bg-zinc-600"
          onClick={setPrevious}
        >
          Prev
        </Button>

        <Button
          className="min-w-0 rounded-lg bg-zinc-800 px-4 py-2 text-base font-medium antialiased hover:bg-zinc-700 active:bg-zinc-600"
          onClick={setNext}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

function Step3({
  setPrevious,
  setNext,
}: {
  setPrevious: () => void;
  setNext: () => void;
}) {
  return (
    <div className="flex h-dvh max-h-[630px] flex-col overflow-y-auto overscroll-y-contain sm:max-h-[610px] lg:max-h-[562px]">
      <div className="flex-1">
        <div className="flex justify-center p-6">
          <div className="flex justify-center lg:hidden">
            <Image
              width={0}
              height={0}
              src="/images/webinar/event-detail-non-creator-mobile.png"
              alt="A mobile view of event page"
              className="h-auto w-full max-w-[320px]"
              loading="lazy"
              unoptimized
            />
          </div>
          <div className="hidden justify-center lg:flex">
            <Image
              width={0}
              height={0}
              src="/images/webinar/event-detail-non-creator-desktop.png"
              alt="A desktop view of event page"
              className="h-auto w-full"
              loading="lazy"
              unoptimized
            />
          </div>
        </div>
        <p className="text-pretty px-6 py-2 text-sm text-zinc-300">
          Your event page is ready! Visitors can easily find details and
          register. Now you can share it to announce your event.
        </p>
      </div>
      <div className="flex justify-between gap-3 p-6">
        <Button
          className="min-w-0 rounded-lg bg-zinc-800 px-4 py-2 text-base font-medium antialiased hover:bg-zinc-700 active:bg-zinc-600"
          onClick={setPrevious}
        >
          Prev
        </Button>

        <Button
          className="min-w-0 rounded-lg bg-zinc-800 px-4 py-2 text-base font-medium antialiased hover:bg-zinc-700 active:bg-zinc-600"
          onClick={setNext}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

function Step4({
  setPrevious,
  setNext,
}: {
  setPrevious: () => void;
  setNext: () => void;
}) {
  return (
    <div className="flex h-dvh max-h-[630px] flex-col overflow-y-auto overscroll-y-contain sm:max-h-[610px] lg:max-h-[562px]">
      <div className="flex-1">
        <div className="flex justify-center p-6">
          <div className="flex justify-center lg:hidden">
            <Image
              width={0}
              height={0}
              src="/images/webinar/host-in-the-webinar-room-mobile.png"
              alt="A mobile view of webinar session with audiences"
              className="h-auto w-full max-w-[320px]"
              loading="lazy"
              unoptimized
            />
          </div>
          <div className="hidden justify-center lg:flex">
            <Image
              width={0}
              height={0}
              src="/images/webinar/host-in-the-webinar-room-desktop.png"
              alt="A desktop view of webinar session with audiences"
              className="h-auto w-full"
              loading="lazy"
              unoptimized
            />
          </div>
        </div>
        <p className="text-pretty px-6 py-2 text-sm text-zinc-300">
          Connect with your audience in real-time! Invite speakers, share
          presentations, chat with attendees, and answer questions live.
        </p>
      </div>
      <div className="flex justify-between gap-3 p-6">
        <Button
          className="min-w-0 rounded-lg bg-zinc-800 px-4 py-2 text-base font-medium antialiased hover:bg-zinc-700 active:bg-zinc-600"
          onClick={setPrevious}
        >
          Prev
        </Button>

        <Button
          className="min-w-0 rounded-lg bg-zinc-800 px-4 py-2 text-base font-medium antialiased hover:bg-zinc-700 active:bg-zinc-600"
          onClick={setNext}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

function Step5({
  setPrevious,
  setNext,
}: {
  setPrevious: () => void;
  setNext: () => void;
}) {
  return (
    <div className="flex h-dvh max-h-[630px] flex-col overflow-y-auto overscroll-y-contain sm:max-h-[610px] lg:max-h-[562px]">
      <div className="flex-1">
        <div className="flex justify-center p-6">
          <div className="flex justify-center lg:hidden">
            <Image
              width={0}
              height={0}
              src="/images/webinar/past-events-mobile.png"
              alt="A mobile view of past events page"
              className="h-auto w-full max-w-[320px]"
              loading="lazy"
              unoptimized
            />
          </div>
          <div className="hidden justify-center lg:flex">
            <Image
              width={0}
              height={0}
              src="/images/webinar/past-events-desktop.png"
              alt="A desktop view of past events page"
              className="h-auto w-full"
              loading="lazy"
              unoptimized
            />
          </div>
        </div>
        <p className="text-pretty px-6 py-2 text-sm text-zinc-300">
          After your event ends, see a stats summary or dig into detailed stats
          to understand your audience and improve your next webinar. — coming
          soon
        </p>
      </div>
      <div className="flex justify-between gap-3 p-6">
        <Button
          className="min-w-0 rounded-lg bg-zinc-800 px-4 py-2 text-base font-medium antialiased hover:bg-zinc-700 active:bg-zinc-600"
          onClick={setPrevious}
        >
          Prev
        </Button>

        <Button
          className="min-w-0 rounded-lg bg-zinc-800 px-4 py-2 text-base font-medium antialiased hover:bg-zinc-700 active:bg-zinc-600"
          onClick={setNext}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

function Step6({
  setPrevious,
  setNext,
}: {
  setPrevious: () => void;
  setNext: () => void;
}) {
  return (
    <div className="flex h-dvh max-h-[630px] flex-col overflow-y-auto overscroll-y-contain sm:max-h-[610px] lg:max-h-[562px]">
      <div className="flex-1">
        <div className="flex justify-center p-6">
          <div className="flex justify-center lg:hidden">
            <Image
              width={0}
              height={0}
              src="/images/webinar/past-event-participant-list-mobile.png"
              alt="A mobile view of past event participant list"
              className="h-auto w-full max-w-[320px]"
              loading="lazy"
              unoptimized
            />
          </div>
          <div className="hidden justify-center lg:flex">
            <Image
              width={0}
              height={0}
              src="/images/webinar/past-event-participant-list-desktop.png"
              alt="A desktop view of past event participant list"
              className="h-auto w-full"
              loading="lazy"
              unoptimized
            />
          </div>
        </div>
        <p className="text-pretty px-6 py-2 text-sm text-zinc-300">
          See a detailed participant lists to help you personalize follow-ups,
          re-invite, and boost future attendance. — coming soon
        </p>
      </div>
      <div className="flex justify-between gap-3 p-6">
        <Button
          className="min-w-0 rounded-lg bg-zinc-800 px-4 py-2 text-base font-medium antialiased hover:bg-zinc-700 active:bg-zinc-600"
          onClick={setPrevious}
        >
          Prev
        </Button>

        <Button
          className="min-w-0 rounded-lg bg-zinc-800 px-4 py-2 text-base font-medium antialiased hover:bg-zinc-700 active:bg-zinc-600"
          onClick={setNext}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

function Step7() {
  return (
    <div className="flex h-dvh max-h-[630px] flex-col overflow-y-auto overscroll-y-contain sm:max-h-[610px] lg:max-h-[562px]">
      <div className="flex-1">
        <div className="flex justify-center p-6">
          <div className="flex justify-center lg:hidden">
            <Image
              width={0}
              height={0}
              src="/images/webinar/create-event-form-mobile.png"
              alt="A mobile view of create event form"
              className="h-auto w-full max-w-[320px]"
              loading="lazy"
              unoptimized
            />
          </div>
          <div className="hidden justify-center lg:flex">
            <Image
              width={0}
              height={0}
              src="/images/webinar/create-event-form-desktop.png"
              alt="A desktop view of create event form"
              className="h-auto w-full"
              loading="lazy"
              unoptimized
            />
          </div>
        </div>
        <p className="text-pretty px-6 py-2 text-sm text-zinc-300">
          We have a simple form to help you in creating webinar events. Let’s
          see it there!
        </p>
      </div>
      <div className="flex items-center justify-between gap-3 p-6">
        <a
          href="https://inlive.app/blog"
          target="_blank"
          className="text-base font-medium text-red-500 outline-none hover:text-red-400 active:text-red-300"
        >
          Learn more
        </a>
        <Button
          as={Link}
          href="/events/create"
          className="min-w-0 rounded-lg bg-red-700 px-4 py-2 text-base font-medium antialiased hover:bg-red-600 active:bg-red-500"
        >
          Ok, take me there
        </Button>
      </div>
    </div>
  );
}
