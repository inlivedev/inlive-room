'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@nextui-org/react';
import JoinRoomField from '@/_features/home/join-room-field';
import TablerArrowRightIcon from '@/_shared/components/icons/tabler-arrow-right-icon';

export default function NotSignedIn() {
  const openSignInModal = () => {
    document.dispatchEvent(new CustomEvent('open:sign-in-modal'));
  };

  return (
    <div>
      <div className="flex flex-col gap-10 py-10 md:flex-row md:py-20 lg:gap-20">
        <div className="md:flex-auto">
          <section className="md:max-w-xl">
            <h2 className="text-3xl font-semibold tracking-wide text-zinc-200 lg:text-4xl">
              Virtual room for your real-time collaboration
            </h2>
            <p className="mt-4 text-pretty text-base text-zinc-400 lg:text-lg">
              Connect with anyone, anywhere. Host or join in seconds. It&apos;s
              that simple! Experience real-time messaging, video, and audio for
              seamless collaboration, all within open-source virtual rooms.
            </p>
            <div className="mt-8 flex flex-row flex-wrap gap-4">
              <div>
                <Button
                  className="h-auto min-h-0 min-w-0 rounded-lg bg-red-700 px-6 py-2.5 text-sm font-medium text-zinc-100 antialiased hover:bg-red-600 active:bg-red-500"
                  onPress={openSignInModal}
                >
                  Sign in to try inLive Room
                </Button>
              </div>
              <div>
                <Button
                  as={Link}
                  href="/#features"
                  className="inline-flex h-auto min-h-0 min-w-0 items-center gap-2 rounded-lg bg-zinc-700 px-6 py-2.5 pr-5 text-zinc-100 antialiased hover:bg-zinc-600 active:bg-zinc-500"
                >
                  <span className="text-sm font-medium">Learn more</span>
                  <span>
                    <TablerArrowRightIcon className="h-5 w-5 rotate-90" />
                  </span>
                </Button>
              </div>
            </div>
          </section>
        </div>
        <div className="flex justify-center md:flex-1 md:justify-end">
          <div className="w-[400px] md:w-[320px] lg:w-[400px]">
            <div className="rounded-2xl border border-zinc-950 bg-zinc-950/25 p-6 lg:p-8">
              <p className="mb-4 text-base font-medium text-zinc-400">
                Got a room code to join?
              </p>
              <JoinRoomField />
            </div>
          </div>
        </div>
      </div>
      <div id="features" className="flex flex-col gap-6 py-10">
        <div className="rounded-xl bg-zinc-900 px-6 py-4 md:px-8 md:py-6">
          <div className="flex flex-col gap-5 sm:flex-row">
            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:gap-5">
              <div>
                <div className="text-zinc-200 sm:p-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M14 6a2 2 0 1 0-4 0a2 2 0 0 0 4 0zM7 18a2 2 0 1 0-4 0a2 2 0 0 0 4 0zm14 0a2 2 0 1 0-4 0a2 2 0 0 0 4 0zM7 18h10m1-2l-5-8m-2 0l-5 8"
                    />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-zinc-200">
                  All-in-one for webinar event
                </h3>
                <p className="mt-1 text-base text-zinc-400">
                  Not only create, you also can manage registration, invitation,
                  and get analytics of your webinar event.
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <Button
                as={Link}
                href="/events"
                className="inline-flex h-auto min-h-0 min-w-0 items-center gap-2 rounded-md bg-zinc-700 py-2.5 pl-4 pr-3 text-zinc-100 antialiased hover:bg-zinc-600 active:bg-zinc-500"
              >
                <span className="text-sm font-medium">See feature tour</span>
                <span>
                  <TablerArrowRightIcon className="h-5 w-5" />
                </span>
              </Button>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-6 md:flex-row">
          <div className="rounded-xl bg-zinc-900 px-6 py-4 md:px-8 md:py-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-5">
              <div>
                <div className="text-zinc-200 sm:p-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12.5 21H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v5m-4-9v4M8 3v4m-4 4h16m-4 8h6m-3-3v6"
                    />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-zinc-200">
                  Scheduled meeting
                </h3>
                <p className="mt-1 text-base text-zinc-400">
                  Set your schedule for important meeting and sent invitation by
                  email. As easy as that.
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-zinc-900 px-6 py-4 md:px-8 md:py-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-5">
              <div>
                <div className="text-zinc-200 sm:p-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 11h18M5 11V7a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v4M4 17a3 3 0 1 0 6 0a3 3 0 1 0-6 0m10 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0m-4 0h4"
                    />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-zinc-200">
                  Anonymous meeting participant
                </h3>
                <p className="mt-1 text-base text-zinc-400">
                  Participant can join your meeting from shared link or room
                  code as a guest without signing in.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-8 py-20 sm:flex-row xl:gap-16">
        <div className="w-full sm:max-w-[280px] md:max-w-[360px] lg:max-w-[480px]">
          <Image
            width={0}
            height={0}
            src="/images/webinar/host-in-the-webinar-room-desktop-quality.png"
            alt="A desktop view of webinar session with audiences"
            className="h-auto w-full object-cover"
            loading="lazy"
            unoptimized
          />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-zinc-200">
            Seamless quality for uninterrupted communication
          </h3>
          <div className="mt-3 flex flex-col gap-6 text-base text-zinc-400">
            <p>
              With latency less than 10 milliseconds, you can experience
              seamless streaming, even in challenging network conditions.
            </p>
            <p>
              Our adaptive bitrate and streaming protection technology ensures
              smooth playback, while the audio/video packet loss protection
              technology guarantees uninterrupted communication, even in highly
              congested network environments.
            </p>
          </div>
        </div>
      </div>
      <div className="py-10">
        <div className="grid grid-cols-1 gap-8 rounded-xl bg-zinc-900 px-6 py-5 md:px-10 md:py-8 lg:grid-cols-2 xl:gap-16">
          <div>
            <h3 className="text-xl font-semibold text-zinc-200">
              Ready to build a similar project as this one?
            </h3>
            <div className="mt-3 flex flex-col gap-6 text-base text-zinc-400">
              <p>
                Because if you are, you can build your own now. The source code
                of this project is available for free to use by everyone through
                GitHub.
              </p>
              <p>
                When you are already signed in to GitHub, grab a copy of it by
                hitting one of the buttons. Build a completely different project
                web app or give the existing a new look under your name!
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <Button
                as={Link}
                href="https://github.com/inlivedev/inlive-room/generate"
                target="_blank"
                rel="noopener noreferrer"
                className="h-full min-h-0 w-full min-w-0 justify-start whitespace-normal rounded-xl bg-zinc-900 px-5 py-3 antialiased ring-1 ring-zinc-700 hover:bg-zinc-800 active:bg-zinc-700"
              >
                <div className="w-full">
                  <b className="flex items-center justify-between gap-2 text-base font-semibold text-zinc-200">
                    <span>Create from template</span>
                    <span>
                      <TablerArrowRightIcon className="h-5 w-5" />
                    </span>
                  </b>
                  <p className="mt-1 text-sm text-zinc-400">
                    Create a GitHub repository using this project template
                  </p>
                </div>
              </Button>
            </div>
            <div>
              <Button
                as={Link}
                href="https://github.com/inlivedev/inlive-room/fork"
                target="_blank"
                rel="noopener noreferrer"
                className="h-full min-h-0 w-full min-w-0 justify-start whitespace-normal rounded-xl bg-zinc-900 px-5 py-3 antialiased ring-1 ring-zinc-700 hover:bg-zinc-800 active:bg-zinc-700"
              >
                <div className="w-full">
                  <b className="flex items-center justify-between gap-2 text-base font-semibold text-zinc-200">
                    <span>Fork and modify</span>
                    <span>
                      <TablerArrowRightIcon className="h-5 w-5" />
                    </span>
                  </b>
                  <p className="mt-1 text-sm text-zinc-400">
                    Grab a copy and keep it up-to-date with the original
                    repository
                  </p>
                </div>
              </Button>
            </div>
            <div>
              <Button
                as={Link}
                href="https://github.com/inlivedev/inlive-room/"
                target="_blank"
                rel="noopener noreferrer"
                className="h-full min-h-0 w-full min-w-0 justify-start whitespace-normal rounded-xl bg-zinc-900 px-5 py-3 antialiased ring-1 ring-zinc-700 hover:bg-zinc-800 active:bg-zinc-700"
              >
                <div className="w-full">
                  <b className="flex items-center justify-between gap-2 text-base font-semibold text-zinc-200">
                    <span>Clone or download</span>
                    <span>
                      <TablerArrowRightIcon className="h-5 w-5" />
                    </span>
                  </b>
                  <p className="mt-1 text-sm text-zinc-400">
                    Create a local copy of this project on your device
                  </p>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
