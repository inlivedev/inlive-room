'use client';

import Header from '@/_shared/components/header/header';
import Footer from '@/_shared/components/footer/footer';
import TabNavigation from '@/_features/event/components/tab-navigation';
import { EventType } from '@/_shared/types/event';
import CalendarIcon from '@/_shared/components/icons/calendar-icon';
import { EventStatCard } from './event-stat-card';
import { PageMeta } from '@/_shared/types/types';
import ChevronLeft from '@/_shared/components/icons/chevron-left';
import ChevronRight from '@/_shared/components/icons/chevron-right';
import { Button } from '@nextui-org/react';
import Link from 'next/link';

const navLinks = [
  {
    title: 'My Events',
    href: '/event',
  },
  {
    title: 'Past Events',
    href: '/past-events',
  },
];

export default function PastEvents({
  events,
  meta,
}: {
  events?: EventType.Event[];
  meta: PageMeta;
}) {
  const currentPage = meta.current_page;
  const lastPage = meta.total_page;
  const nextPage = currentPage < lastPage ? currentPage + 1 : 0;
  const previousPage = currentPage > 1 ? currentPage - 1 : 0;

  return (
    <div className="bg-zinc-900">
      <div className="min-viewport-height mx-auto flex h-full w-full max-w-7xl flex-1 flex-col  px-4">
        <Header logoText="inLive Room" logoHref="/" />
        <main className="flex-1">
          <TabNavigation navLinks={navLinks} />
          <div className="mt-5 pb-5 md:pb-10">
            {events && events.length > 0 ? (
              <>
                <ul className="flex flex-col gap-10">
                  {events.map((val) => {
                    return (
                      <EventStatCard event={val} key={val.id}></EventStatCard>
                    );
                  })}
                </ul>
              </>
            ) : (
              <>
                <div className="flex h-60 w-full items-center justify-center rounded border border-zinc-800">
                  <div className="text-center">
                    <div className="flex justify-center">
                      <CalendarIcon width={40} height={40} />
                    </div>
                    <b className="mt-3 block text-lg font-semibold">
                      We&apos;ll keep your finished events here
                    </b>
                    <p className="mt-1.5 text-sm text-zinc-400">
                      Come back to this page once one of your event is finished.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
          {lastPage > 0 &&
            (previousPage || nextPage ? (
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
                        href={`/past-events?page=${previousPage}&limit=${meta.per_page}`}
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
                        href={`/past-events?page=${nextPage}&limit=${meta.per_page}`}
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
            ) : null)}
        </main>
        <div>
          <Footer />
        </div>
      </div>
    </div>
  );
}
