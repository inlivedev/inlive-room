'use client';

import Header from '@/_shared/components/header/header';
import { useAuthContext } from '@/_shared/contexts/auth';
import { EventType } from '@/_shared/types/event';
import { InternalApiFetcher } from '@/_shared/utils/fetcher';
import { Button, Tab, Tabs } from '@nextui-org/react';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { EventCard } from './event-card';

export default function EventList() {
  const { user } = useAuthContext();
  const [listEvent, setListEvent] = useState<
    EventType.ListEventsResponse['data']
  >([]);
  const searchParams = useSearchParams();

  const page = searchParams.get('page') || 1;
  const limit = searchParams.get('limit') || 10;

  useEffect(() => {
    const fetchData = async () => {
      const listEventsReponse: EventType.ListEventsResponse =
        await InternalApiFetcher.get(
          `/api/events?created_by=${user?.id}&page=${page}&limit=${limit}`
        );
      // console.log('repsonse');
      // console.log(listEventsReponse.data);
      setListEvent(listEventsReponse.data);
    };

    fetchData();
  }, [user, page, limit]);

  useEffect(() => {
    console.log(listEvent);
  }, [listEvent]);

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
                <Button className="z-10 w-full rounded-md bg-red-700 px-6 py-2 text-base font-medium text-zinc-100 antialiased hover:bg-red-600 active:bg-red-500 sm:w-fit">
                  Create new event
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-4 pb-20 sm:grid-cols-2 sm:pb-0 sm:pt-1">
                {listEvent ? (
                  listEvent.map((event) => {
                    return <EventCard key={event.id} event={event} />;
                  })
                ) : (
                  <p>No event found</p>
                )}
              </div>
            </div>
          </Tab>
        </Tabs>
      </div>
    </div>
  );
}
