'use client';

import Image from 'next/image';
import { Button } from '@nextui-org/react';
import Header from '@/_shared/components/header/header';
import Footer from '@/_shared/components/footer/footer';
import CalendarIcon from '@/_shared/components/icons/calendar-icon';
import { StatusDraft } from './event-status';
import Link from 'next/link';
import type { EventType } from '@/_shared/types/event';

const APP_ORIGIN = process.env.NEXT_PUBLIC_APP_ORIGIN;

export default function EventDetailDraft({
  event,
}: {
  event: EventType.Event;
}) {
  const descriptionMarkup = {
    __html: event.description || '',
  };

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

  const thumbnailUrl = event.thumbnailUrl
    ? `${APP_ORIGIN}/static${event.thumbnailUrl}`
    : '/images/webinar/webinar-no-image-placeholder.png';

  return (
    <div className="bg-zinc-900">
      <div className="min-viewport-height mx-auto flex max-w-7xl flex-col px-4">
        <Header logoText="inLive Room" logoHref="/" />
        <main className="flex-1">
          <div className="pb-28 lg:pb-0">
            <div className="mb-1.5 lg:mb-3">
              <StatusDraft />
            </div>
            <h2 className="text-2xl font-bold text-zinc-100 lg:text-4xl">
              {event.name}
            </h2>
            <div className="my-4 lg:my-6">
              <b className="font-medium text-zinc-100">
                Hosted by {event.host}
              </b>
            </div>
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:gap-10">
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
              <div className="max-w-sm flex-1">
                <div className="flex w-full flex-col gap-4 rounded-3xl p-6 lg:bg-black/25">
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
                  <div className="flex items-center gap-2">
                    <span>
                      <CalendarIcon width={20} height={20} />
                    </span>
                    <p className="text-base text-zinc-100">
                      {eventStartDate} at {eventStartTime}
                    </p>
                  </div>
                </div>
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
