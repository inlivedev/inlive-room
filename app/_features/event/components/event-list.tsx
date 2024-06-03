'use client';

import Header from '@/_shared/components/header/header';
import Footer from '@/_shared/components/footer/footer';
import { EventType } from '@/_shared/types/event';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@nextui-org/react';
import { EventCard } from './event-card';
import TabNavigation from '@/_features/event/components/tab-navigation';
import ChevronLeft from '@/_shared/components/icons/chevron-left';
import ChevronRight from '@/_shared/components/icons/chevron-right';
import type { SVGElementPropsType, PageMeta } from '@/_shared/types/types';
import { whitelistFeature } from '@/_shared/utils/flag';
import { AuthType } from '@/_shared/types/auth';
import EventWelcomeModal from '@/_features/event/components/event-welcome-modal';

const EVENT_FORM_URL =
  process.env.NEXT_PUBLIC_EVENT_FORM_URL || process.env.NEXT_PUBLIC_APP_ORIGIN;

const navLinks = [
  {
    title: 'My Events',
    href: '/events',
  },
  {
    title: 'Past Events',
    href: '/past-events',
  },
  {
    title: 'Not Ended Events',
    href: '/not-ended-events',
  },
];

export default function EventList({
  events,
  user,
  pageMeta,
  validPagination,
  createEventLimit,
}: {
  events: EventType.Event[];
  user: AuthType.CurrentAuthData | null;
  pageMeta: PageMeta;
  validPagination: boolean;
  createEventLimit: EventType.CreateLimit | undefined;
}) {
  const currentPage = pageMeta.current_page;
  const lastPage = pageMeta.total_page;
  const nextPage = currentPage < lastPage ? currentPage + 1 : 0;
  const previousPage = currentPage > 1 ? currentPage - 1 : 0;

  const limitCreate = createEventLimit?.code === 403;

  return (
    <>
      {!user ? <EventWelcomeModal /> : null}
      <div className="bg-zinc-900">
        <div className="min-viewport-height mx-auto flex h-full w-full max-w-7xl flex-1 flex-col px-4">
          <Header logoText="inLive Room" logoHref="/" />

          {!whitelistFeature.includes('event') === true &&
          user &&
          user.whitelistFeature.includes('event') === false &&
          createEventLimit ? (
            <div className="mx-auto mb-3 flex w-full max-w-3xl flex-col items-center justify-center rounded-md bg-blue-900/25 px-4 py-3 text-center text-blue-300 sm:px-6">
              <p className="text-pretty">
                You have a limit to publish only {createEventLimit.data.limit}{' '}
                events during Beta [{createEventLimit.data.count} of{' '}
                {createEventLimit.data.limit}] left.
                <br className="hidden sm:block" />
                You can fill this&nbsp;
                <a
                  className={
                    'font-semibold text-blue-200 underline underline-offset-4'
                  }
                  href={EVENT_FORM_URL}
                  target="_blank"
                  rel="noreferrer"
                >
                  form
                </a>
                &nbsp;to request an extended limit.
              </p>
            </div>
          ) : null}
          <main className="flex-1">
            <TabNavigation navLinks={navLinks} />
            {events.length > 0 ? (
              <div className="fixed bottom-0 left-0 z-20 w-full border-t border-zinc-700 bg-zinc-900 px-4 pb-6 pt-4 lg:relative lg:z-0 lg:mt-5 lg:border-t-0 lg:p-0 lg:text-right">
                <Button
                  as={Link}
                  href="/events/create"
                  className="w-full min-w-0 rounded-lg bg-red-700 px-6 py-2 text-base font-medium antialiased hover:bg-red-600 active:bg-red-500 lg:w-auto"
                >
                  Create new event
                </Button>
              </div>
            ) : null}
            <div className="mt-5 pb-28 lg:pb-10">
              {validPagination ? (
                <>
                  {events.length > 0 ? (
                    <EventCardList
                      events={events}
                      previousPage={previousPage}
                      nextPage={nextPage}
                      currentPage={currentPage}
                      lastPage={lastPage}
                      pageMeta={pageMeta}
                    />
                  ) : (
                    <div className="flex h-[360px] w-full items-center justify-center rounded-3xl border border-zinc-800 lg:h-80">
                      <div className="text-center">
                        <div className="flex justify-center">
                          <Image
                            src="/images/webinar/calendar-speaker-illustration.svg"
                            alt="Illustration of a calendar with a speaker"
                            width={200}
                            height={100}
                            style={{ objectFit: 'cover' }}
                            unoptimized
                          />
                        </div>
                        <p className="mt-6 text-pretty text-base font-medium text-zinc-400">
                          Click Create new event” button to create your webinar
                          event. Let’s go!
                        </p>
                        <div className="fixed bottom-0 left-0 z-20 w-full border-t border-zinc-700 bg-zinc-900 px-4 pb-6 pt-4 lg:relative lg:z-0 lg:mt-10 lg:border-t-0 lg:p-0">
                          <Button
                            as={Link}
                            isDisabled={limitCreate}
                            href="/events/create"
                            className="w-full min-w-0 rounded-lg bg-red-700 px-6 py-2 text-base font-medium antialiased hover:bg-red-600 active:bg-red-500 lg:w-auto"
                          >
                            Create new event
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex h-[360px] w-full items-center justify-center rounded-3xl border border-zinc-800 lg:h-80">
                  <div className="text-center">
                    <div className="flex justify-center">
                      <EventCalendarIcon width={40} height={40} />
                    </div>
                    <b className="mt-3 block text-lg font-semibold">
                      Oops, no event found
                    </b>
                    <p className="mt-1.5 text-sm text-zinc-400">
                      We couldn&apos;t find any data from your request.
                    </p>
                    {pageMeta.total_page >= 1 ? (
                      <div className="mt-6">
                        <Button
                          as={Link}
                          href="/events"
                          className="min-w-0 rounded-lg bg-zinc-800 px-6 py-2 text-base font-medium antialiased hover:bg-zinc-700 active:bg-zinc-600"
                        >
                          Refresh the page
                        </Button>
                      </div>
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          </main>
          <div className="hidden lg:block">
            <Footer />
          </div>
        </div>
      </div>
    </>
  );
}

export function EventCardList({
  events,
  previousPage,
  nextPage,
  currentPage,
  lastPage,
  pageMeta,
}: {
  events: EventType.Event[];
  previousPage: number;
  nextPage: number;
  currentPage: number;
  lastPage: number;
  pageMeta: PageMeta;
}) {
  const basePath = new URL(window.location.href);

  return (
    <div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {events.map((event) => {
          return <EventCard key={event.id} event={event} />;
        })}
      </div>
      {previousPage || nextPage ? (
        <div className="mt-10 text-sm md:mt-20">
          <p className="pb-4 text-center text-sm font-medium text-zinc-500">
            Page {currentPage} of {lastPage}
          </p>
          <div className="flex items-center justify-center gap-6">
            {previousPage ? (
              <div>
                <Button
                  className="flex h-9 w-36 min-w-0 items-center justify-center gap-2 rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium antialiased hover:bg-zinc-700 active:bg-zinc-600"
                  as={Link}
                  href={`${basePath}?page=${previousPage}&limit=${pageMeta.per_page}`}
                >
                  <span className="flex items-center">
                    <ChevronLeft width={16} height={16} />
                  </span>
                  <span>Previous page</span>
                </Button>
              </div>
            ) : null}
            {nextPage ? (
              <div>
                <Button
                  className="flex h-9 w-36 min-w-0 items-center justify-center gap-2 rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium antialiased hover:bg-zinc-700 active:bg-zinc-600"
                  as={Link}
                  href={`${basePath}?page=${nextPage}&limit=${pageMeta.per_page}`}
                >
                  <span>Next page</span>
                  <span className="flex items-center">
                    <ChevronRight width={16} height={16} />
                  </span>
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function EventCalendarIcon(props: SVGElementPropsType) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="M17.75 3A3.25 3.25 0 0 1 21 6.25v11.5A3.25 3.25 0 0 1 17.75 21H6.25A3.25 3.25 0 0 1 3 17.75V6.25A3.25 3.25 0 0 1 6.25 3h11.5Zm1.75 5.5h-15v9.25c0 .966.784 1.75 1.75 1.75h11.5a1.75 1.75 0 0 0 1.75-1.75V8.5Zm-11.75 6a1.25 1.25 0 1 1 0 2.5a1.25 1.25 0 0 1 0-2.5Zm4.25 0a1.25 1.25 0 1 1 0 2.5a1.25 1.25 0 0 1 0-2.5Zm-4.25-4a1.25 1.25 0 1 1 0 2.5a1.25 1.25 0 0 1 0-2.5Zm4.25 0a1.25 1.25 0 1 1 0 2.5a1.25 1.25 0 0 1 0-2.5Zm4.25 0a1.25 1.25 0 1 1 0 2.5a1.25 1.25 0 0 1 0-2.5Zm1.5-6H6.25A1.75 1.75 0 0 0 4.5 6.25V7h15v-.75a1.75 1.75 0 0 0-1.75-1.75Z"
      />
    </svg>
  );
}
