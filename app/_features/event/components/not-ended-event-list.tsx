'use client';

import { EventType } from '@/_shared/types/event';
import { PageMeta } from '@/_shared/types/types';
import Header from '@/_shared/components/header/header';
import Footer from '@/_shared/components/footer/footer';
import { EventCardList } from './event-list';
import TabNavigation from './tab-navigation';
import { Button, Link } from '@nextui-org/react';

export function NotEndedEventList({
  events,
  pageMeta,
}: {
  events: EventType.Event[];
  pageMeta: PageMeta;
}) {
  const currentPage = pageMeta.current_page;
  const lastPage = pageMeta.total_page;
  const nextPage = currentPage < lastPage ? currentPage + 1 : 0;
  const previousPage = currentPage > 1 ? currentPage - 1 : 0;

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

  return (
    <div className="bg-zinc-900">
      <div className="min-viewport-height mx-auto flex h-full w-full max-w-7xl flex-1 flex-col px-4">
        <Header logoText="inLive Room" logoHref="/" />

        <main className="flex flex-col gap-2">
          <TabNavigation navLinks={navLinks} />

          {events.length < 0 ? (
            <EventCardList
              events={events}
              previousPage={previousPage}
              nextPage={nextPage}
              currentPage={currentPage}
              lastPage={lastPage}
              pageMeta={pageMeta}
            />
          ) : (
            <div className="flex h-[360px] w-full flex-col items-center justify-center gap-2 rounded-3xl border border-zinc-800 lg:h-80">
              <p>
                No events needed to be ended, you are all caught up! You may
                view your past events or upcoming events.
              </p>

              <div className="flex flex-row gap-2">
                <Button
                  as={Link}
                  className="min-w-0 rounded-md bg-zinc-800 px-4 py-2 text-base font-medium text-white antialiased hover:bg-zinc-700 active:bg-zinc-600"
                  href="/events"
                >
                  View Upcoming Events
                </Button>
                <Button
                  as={Link}
                  className="min-w-0 rounded-md bg-zinc-800 px-4 py-2 text-base font-medium text-white antialiased hover:bg-zinc-700 active:bg-zinc-600"
                  href="/past-events"
                >
                  View Past Events
                </Button>
              </div>
            </div>
          )}
        </main>
        <div className="hidden lg:block">
          <Footer />
        </div>
      </div>
    </div>
  );
}
