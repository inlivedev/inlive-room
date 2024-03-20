'use client';

import Image from 'next/image';
import dynamic from 'next/dynamic';
import { Button } from '@nextui-org/react';
import Header from '@/_shared/components/header/header';
import Footer from '@/_shared/components/footer/footer';
import Link from 'next/link';
import type { EventType } from '@/_shared/types/event';
import { copyToClipboard } from '@/_shared/utils/copy-to-clipboard';
import { useToggle } from '@/_shared/hooks/use-toggle';
import ClockFillIcon from '@/_shared/components/icons/clock-fill-icon';
import CameraOnIcon from '@/_shared/components/icons/camera-on-icon';

const APP_ORIGIN = process.env.NEXT_PUBLIC_APP_ORIGIN;

export default function EventDetail({
  event,
  status,
  startDateWithYear,
  startDateWithoutYear,
  startTime,
  endTime,
}: {
  event: EventType.Event;
  status: 'draft' | 'public';
  startDateWithoutYear: string;
  startDateWithYear: string;
  startTime: string;
  endTime: string;
}) {
  const descriptionMarkup = {
    __html: event.description || '',
  };

  const thumbnailUrl = event.thumbnailUrl
    ? `${APP_ORIGIN}/static${event.thumbnailUrl}`
    : '/images/webinar/webinar-no-image-placeholder.png';

  return (
    <div className="bg-zinc-900">
      <div className="min-viewport-height mx-auto flex max-w-7xl flex-col px-4">
        <Header logoText="inLive Room" logoHref="/" />
        <main className="flex-1">
          <div className="pb-28 lg:pb-0">
            <div className="mb-0.5 flex items-center gap-4 lg:mb-0">
              <b className="font-semibold text-zinc-200">
                {startDateWithoutYear}
              </b>
            </div>
            <h2 className="text-wrap text-2xl font-bold tracking-wide text-zinc-100 lg:text-[42px] lg:leading-[52px]">
              {event.name}
            </h2>
            {typeof event.host?.name === 'string' ? (
              <b className="mt-4 block font-medium text-zinc-300 lg:mt-6">
                Hosted by {event.host.name}
              </b>
            ) : null}
            <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:gap-10">
              <div className="lg:order-2 lg:flex-1">
                <div className="flex w-full flex-col gap-6 rounded-2xl lg:sticky lg:top-6 lg:ml-auto lg:max-w-[440px] lg:bg-zinc-950/25 lg:p-8 lg:ring-1 lg:ring-zinc-800">
                  <div className="flex flex-col gap-4 lg:gap-6">
                    <div className="flex items-center gap-4 rounded-lg text-sm">
                      <span className="rounded-lg bg-zinc-700/60 p-2">
                        <ClockFillIcon
                          width={24}
                          height={24}
                          className="text-zinc-100"
                        />
                      </span>
                      <div>
                        <b className="font-semibold text-zinc-100">
                          {startDateWithYear}
                        </b>
                        <div className="mt-0.5 text-zinc-300">
                          {startTime} to {endTime}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 rounded-lg text-sm">
                      <span className="rounded-lg bg-zinc-700/60 p-2">
                        <CameraOnIcon
                          width={24}
                          height={24}
                          className="text-zinc-100"
                        />
                      </span>
                      <div>
                        <b className="font-semibold text-zinc-100">
                          Online webinar
                        </b>
                        <div className="mt-0.5 text-zinc-300">
                          Attendees will receive a link
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 rounded-lg text-sm">
                      <span className="rounded-lg bg-zinc-700/60 p-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                        >
                          <path
                            fill="currentColor"
                            d="M16 17v2H2v-2s0-4 7-4s7 4 7 4m-3.5-9.5A3.5 3.5 0 1 0 9 11a3.5 3.5 0 0 0 3.5-3.5m3.44 5.5A5.32 5.32 0 0 1 18 17v2h4v-2s0-3.63-6.06-4M15 4a3.39 3.39 0 0 0-1.93.59a5 5 0 0 1 0 5.82A3.39 3.39 0 0 0 15 11a3.5 3.5 0 0 0 0-7Z"
                          />
                        </svg>
                      </span>
                      <div>
                        <b className="font-semibold text-zinc-100">
                          No participant limit
                        </b>
                        <div className="mt-0.5 text-zinc-300">
                          Anyone can freely join this webinar
                        </div>
                      </div>
                    </div>
                  </div>
                  {status === 'draft' ? (
                    <DraftAction event={event} />
                  ) : (
                    <PublicAction event={event} startTime={startTime} />
                  )}
                </div>
              </div>
              <div className="w-full lg:order-1 lg:max-w-[640px] lg:flex-auto">
                <div className="max-w-[640px]">
                  <Image
                    referrerPolicy="no-referrer"
                    width={640}
                    height={320}
                    src={thumbnailUrl}
                    alt={`Thumbnail image of ${event.name}`}
                    style={{ aspectRatio: '2/1' }}
                    className="w-full rounded-3xl"
                    priority={true}
                    unoptimized
                  />
                </div>
                <div
                  className="prose prose-sm mt-6 max-w-none text-pretty text-zinc-200 lg:prose-base prose-img:rounded-2xl prose-img:lg:rounded-3xl"
                  dangerouslySetInnerHTML={descriptionMarkup}
                ></div>
              </div>
            </div>
          </div>
        </main>
        <div className="hidden lg:block">
          <Footer />
        </div>
      </div>
    </div>
  );
}

function DraftAction({ event }: { event: EventType.Event }) {
  return (
    <div className="fixed bottom-0 left-0 z-20 w-full border-t border-zinc-700 bg-zinc-900 px-4 pb-6 pt-4 lg:relative lg:z-0 lg:w-auto lg:bg-transparent lg:px-0 lg:py-6">
      <div className="text-center">
        <Button
          href={`/events/${event.slug}/edit`}
          as={Link}
          className="w-full max-w-lg rounded-md bg-red-700 px-4 py-2 text-base font-medium antialiased hover:bg-red-600 active:bg-red-500"
        >
          Edit data
        </Button>
      </div>
    </div>
  );
}

function PublicAction({
  event,
  startTime,
}: {
  event: EventType.Event;
  startTime: string;
}) {
  const EventRegistrationModal = dynamic(
    () => import('@/_features/event/components/event-registration-modal')
  );

  const {
    active: copiedActive,
    setActive: setCopiedActive,
    setInActive: setCopiedInActive,
  } = useToggle(false);

  const handleCopyLink = async (text = '') => {
    const success = await copyToClipboard(text);

    if (success) {
      setCopiedActive();
      setTimeout(() => {
        setCopiedInActive();
      }, 2000);
    } else {
      alert('Failed to copy link');
    }
  };

  const openRegisterEventForm = () => {
    document.dispatchEvent(new CustomEvent('open:event-registration-modal'));
  };

  return (
    <>
      <EventRegistrationModal
        title={event.name}
        slug={event.slug}
        startTime={startTime}
      />
      <div className="fixed bottom-0 left-0 z-20 w-full border-t border-zinc-700 bg-zinc-900 px-4 pb-6 pt-4 lg:relative lg:z-0 lg:w-auto lg:bg-transparent lg:px-0 lg:py-6">
        <div className="flex items-center justify-center gap-4">
          <b className="text flex items-center text-base font-semibold uppercase tracking-wide text-white">
            Free
          </b>
          <Button
            className="flex min-w-0 items-center gap-2 rounded-md bg-zinc-800 px-4 py-2 text-base font-medium text-white antialiased hover:bg-zinc-700 active:bg-zinc-600"
            onClick={() => handleCopyLink(`${APP_ORIGIN}/events/${event.slug}`)}
          >
            {copiedActive ? 'Copied!' : 'Copy link'}
          </Button>
          <div className="flex-auto">
            <Button
              className="w-full rounded-md bg-red-700 px-4 py-2 text-base font-medium text-white antialiased hover:bg-red-600 active:bg-red-500"
              onClick={openRegisterEventForm}
            >
              Register to Attend
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
