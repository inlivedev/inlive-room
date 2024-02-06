'use client';

import Header from '@/_shared/components/header/header';
import { EventType } from '@/_shared/types/event';
import { Button, Link, Tab, Tabs } from '@nextui-org/react';
import { useEffect, useState } from 'react';
import { EventCard } from './event-card';
import EditIcon from '@/_shared/components/icons/edit-icon';

export default function EventList({
  events,
}: {
  events: EventType.ListEventsResponse['data'];
}) {
  const [listEvent, setListEvent] = useState<
    EventType.ListEventsResponse['data']
  >([]);

  useEffect(() => {
    if (events) {
      setListEvent(events);
    }
  }, [events]);

  return (
    <div className="min-viewport-height bg-zinc-900 text-zinc-200">
      <div className="min-viewport-height mx-auto flex w-full max-w-6xl flex-1 flex-col px-4">
        <Header logoText="inLive Room" logoHref="/" needAuth={true} />
        <Tabs
          key={'underlined'}
          variant={'underlined'}
          aria-label="tab"
          classNames={{
            tabList:
              'gap-6 w-full relative rounded-none p-0 border-b border-divider',
            cursor: 'w-full',
            tab: 'max-w-fit px-0 h-12',
          }}
        >
          <Tab key="my-events" title="My Events">
            <div className="flex flex-col gap-y-2">
              <div className="fixed bottom-0 left-0 z-10 flex w-full justify-end gap-2 border-t border-zinc-700 bg-zinc-900 px-4 py-3 sm:relative  sm:gap-0 sm:border-t-0 sm:bg-transparent sm:p-0 lg:p-0">
                <Button
                  href="/event/create"
                  as={Link}
                  className="z-10 w-full rounded-md bg-red-700 px-6 py-2 text-base font-medium text-zinc-100 antialiased hover:bg-red-600 active:bg-red-500 sm:w-fit"
                >
                  <div className="flex items-center gap-unit-2 align-middle">
                    <EditIcon height={20} width={20} />
                    Create new event
                  </div>
                </Button>
              </div>
              {listEvent.length === 0 && (
                <p className="w-full">{"You haven't created any event"}</p>
              )}
              <div className="grid grid-cols-1 gap-4 pb-20 sm:grid-cols-2 sm:pb-0 sm:pt-1">
                {listEvent.map((event) => {
                  return <EventCard key={event.id} event={event} />;
                })}
              </div>
            </div>
          </Tab>
        </Tabs>
      </div>
    </div>
  );
}
