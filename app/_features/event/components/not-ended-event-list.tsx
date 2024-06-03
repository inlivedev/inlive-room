import { EventType } from '@/_shared/types/event';
import { PageMeta } from '@/_shared/types/types';
import Header from '@/_shared/components/header/header';
import Footer from '@/_shared/components/footer/footer';
import { EventCardList } from './event-list';
import TabNavigation from './tab-navigation';

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

          {/* <TabNavigation navLinks={navLinks} /> */}
          <EventCardList
            events={events}
            previousPage={previousPage}
            nextPage={nextPage}
            currentPage={currentPage}
            lastPage={lastPage}
            pageMeta={pageMeta}
          />
        </main>
        <div className="hidden lg:block">
          <Footer />
        </div>
      </div>
    </div>
  );
}
