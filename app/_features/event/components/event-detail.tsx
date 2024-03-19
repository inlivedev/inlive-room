'use client';

import Image from 'next/image';
import dynamic from 'next/dynamic';
import { Button } from '@nextui-org/react';
import Header from '@/_shared/components/header/header';
import Footer from '@/_shared/components/footer/footer';
import CalendarIcon from '@/_shared/components/icons/calendar-icon';
import { StatusDraft } from './event-status';
import Link from 'next/link';
import type { EventType } from '@/_shared/types/event';
import { copyToClipboard } from '@/_shared/utils/copy-to-clipboard';
import { useToggle } from '@/_shared/hooks/use-toggle';

const APP_ORIGIN = process.env.NEXT_PUBLIC_APP_ORIGIN;

export default function EventDetail({
  event,
  status,
}: {
  event: EventType.Event;
  status: 'draft' | 'public';
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
            {status === 'draft' ? (
              <div className="mb-1.5 lg:mb-3">
                <StatusDraft />
              </div>
            ) : null}
            <h2 className="text-2xl font-bold text-zinc-100 lg:text-4xl">
              {event.name}
            </h2>
            <div className="my-4 lg:my-6">
              <b className="font-medium text-zinc-100">
                Hosted by {event.host}
              </b>
            </div>
            <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
              <div className="w-full lg:max-w-[640px] lg:flex-auto">
                <div className="max-w-[640px]">
                  <Image
                    referrerPolicy="no-referrer"
                    width={640}
                    height={320}
                    src={thumbnailUrl}
                    alt={`Thumbnail image of ${event.name}`}
                    loading="lazy"
                    style={{ aspectRatio: '2/1' }}
                    className="w-full rounded-3xl"
                    unoptimized
                  />
                </div>
                <div
                  className="prose prose-sm mt-6 max-w-none text-zinc-200 lg:prose-base prose-img:rounded-2xl prose-img:lg:rounded-3xl"
                  dangerouslySetInnerHTML={descriptionMarkup}
                ></div>
              </div>
              <div className="flex justify-end lg:flex-1">
                {status === 'draft' ? (
                  <DraftAction event={event} />
                ) : (
                  <PublicAction event={event} />
                )}
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

function EventDate({ event }: { event: EventType.Event }) {
  const eventStartDate = new Date(event.startTime).toLocaleDateString('en-GB', {
    month: 'long',
    day: '2-digit',
    year: 'numeric',
  });

  const eventStartTime = new Date(event.startTime).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <div className="flex items-center gap-2">
      <span>
        <CalendarIcon width={20} height={20} />
      </span>
      <p className="text-base text-zinc-100">
        {eventStartDate} at {eventStartTime}
      </p>
    </div>
  );
}

function DraftAction({ event }: { event: EventType.Event }) {
  return (
    <div className="flex w-full max-w-sm flex-col gap-4 rounded-3xl p-6 lg:bg-black/25">
      <div className="fixed bottom-0 left-0 z-20 w-full border-t border-zinc-700 bg-zinc-900 px-4 pb-6 pt-4 lg:relative lg:z-0 lg:w-auto lg:border-0 lg:bg-transparent lg:p-0">
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
      <EventDate event={event} />
    </div>
  );
}

function PublicAction({ event }: { event: EventType.Event }) {
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
    <div className="flex w-full flex-col gap-4 rounded-3xl p-6 lg:bg-black/25">
      <EventRegistrationModal
        title={event.name}
        slug={event.slug}
        startTime={event.startTime}
      />
      <div className="fixed bottom-0 left-0 z-20 w-full border-t border-zinc-700 bg-zinc-900 px-4 pb-6 pt-4 lg:relative lg:z-0 lg:w-auto lg:border-0 lg:bg-transparent lg:p-0">
        <div className="flex items-center justify-center gap-4">
          <div className="flex-auto">
            <Button
              className="w-full rounded-md bg-red-700 px-4 py-2 text-base font-medium antialiased hover:bg-red-600 active:bg-red-500"
              onClick={openRegisterEventForm}
            >
              Register to Attend
            </Button>
          </div>
          <div>
            <Button
              className="flex min-w-0 items-center gap-2 rounded-md bg-zinc-800 px-4 py-2 text-base font-medium antialiased hover:bg-zinc-700 active:bg-zinc-600"
              onClick={() =>
                handleCopyLink(`${APP_ORIGIN}/events/${event.slug}`)
              }
            >
              {copiedActive ? 'Copied!' : 'Copy link'}
            </Button>
          </div>
        </div>
      </div>
      <EventDate event={event} />
    </div>
  );
}
