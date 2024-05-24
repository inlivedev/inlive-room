'use client';
import { useState } from 'react';
import { Button } from '@nextui-org/react';
import type { EventType } from '@/_shared/types/event';
import { useFormattedDateTime } from '@/_shared/hooks/use-formatted-datetime';
import Link from 'next/link';

export default function MeetingList({ events }: { events: EventType.Event[] }) {
  const [activeTab, setActiveTab] = useState<'today' | 'upcoming'>('today');

  const { todayEvents, upcomingEvents } = events.reduce(
    (accumulator, currentValue) => {
      const today = new Date(new Date().setHours(0, 0, 0, 0));
      const eventEndTime = new Date(
        new Date(currentValue.endTime).setHours(0, 0, 0, 0)
      );

      if (eventEndTime > today) {
        let upcomingEvents = [...accumulator.upcomingEvents, currentValue];

        upcomingEvents = upcomingEvents.slice().sort((eventA, eventB) => {
          const eventATime = new Date(eventA.startTime).getTime();
          const eventBTime = new Date(eventB.startTime).getTime();
          return eventATime - eventBTime;
        });

        return {
          ...accumulator,
          upcomingEvents,
        };
      } else if (eventEndTime.toDateString() === today.toDateString()) {
        let todayEvents = [...accumulator.todayEvents, currentValue];

        todayEvents = todayEvents.slice().sort((eventA, eventB) => {
          const eventATime = new Date(eventA.startTime).getTime();
          const eventBTime = new Date(eventB.startTime).getTime();
          return eventATime - eventBTime;
        });

        return {
          ...accumulator,
          todayEvents,
        };
      }

      return { ...accumulator };
    },
    {
      todayEvents: [] as EventType.Event[],
      upcomingEvents: [] as EventType.Event[],
    }
  );

  const activeEvents: EventType.Event[] = ([] =
    activeTab === 'today' ? todayEvents : upcomingEvents);

  return (
    <div className="max-w-full rounded-xl bg-zinc-900 ring-1 ring-zinc-800">
      <nav className="px-4 pt-4">
        <ul className="flex items-center border-b border-zinc-800 text-sm font-medium">
          <li className="relative py-2">
            <Button
              className={`h-8 min-h-0 w-full min-w-0 rounded bg-transparent px-3 py-1.5 font-medium antialiased hover:bg-zinc-800 active:bg-zinc-700 ${
                activeTab === 'today' ? 'text-zinc-100' : 'text-zinc-400'
              }`}
              onPress={() => setActiveTab('today')}
            >
              Today
            </Button>
            {activeTab === 'today' ? (
              <div className="absolute bottom-0 left-1/2 inline-block h-[2px] w-3/4 -translate-x-1/2 bg-white"></div>
            ) : null}
          </li>
          <li className="relative py-2">
            <Button
              className={`h-8 min-h-0 w-full min-w-0 rounded bg-transparent px-3 py-1.5 font-medium antialiased hover:bg-zinc-800 active:bg-zinc-700 ${
                activeTab === 'upcoming' ? 'text-zinc-100' : 'text-zinc-400'
              }`}
              onPress={() => setActiveTab('upcoming')}
            >
              Upcoming
            </Button>
            {activeTab === 'upcoming' ? (
              <div className="absolute bottom-0 left-1/2 inline-block h-[2px] w-3/4 -translate-x-1/2 bg-white"></div>
            ) : null}
          </li>
        </ul>
      </nav>

      {activeEvents.length > 0 ? (
        <div className="relative">
          <ul className="flex h-[300px] flex-col gap-4 overflow-y-auto overflow-x-hidden overscroll-contain px-4 pb-5 pt-4">
            {activeEvents.map((event, index) => {
              const active = index === 0 && activeTab === 'today';

              return (
                <li key={event.id}>
                  <MeetingItem
                    activeTab={activeTab}
                    activeItem={active}
                    event={event}
                  />
                </li>
              );
            })}
          </ul>
          <div className="absolute bottom-0 left-0 h-8 w-full bg-gradient-to-t from-zinc-900 to-zinc-900/30"></div>
        </div>
      ) : (
        <div className="flex h-[300px] flex-col items-center justify-center p-4 text-center md:p-6">
          <div>
            <p className="text-sm font-medium text-zinc-400 md:text-base">
              {activeTab === 'today'
                ? `You don't have any schedule for today`
                : `You don't have any schedule for the upcoming days`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

const MeetingItem = ({
  event,
  activeTab,
  activeItem = false,
}: {
  event: EventType.Event;
  activeTab: 'today' | 'upcoming';
  activeItem?: boolean;
}) => {
  const startTime = new Date(event.startTime);
  const endTime = new Date(event.endTime);
  const startDate = useFormattedDateTime(event.startTime, 'en-GB', {
    month: 'short',
    day: 'numeric',
  });
  const currentTime = new Date();
  const startHour = startTime.getHours();
  const startMinute = startTime.getMinutes();
  const now = currentTime > startTime && currentTime < endTime;

  return (
    <Button
      as={Link}
      href={`/rooms/${event.roomId}`}
      className={`flex h-[66px] min-h-0 w-full min-w-0 items-center gap-4 rounded px-4 py-3 antialiased ${
        activeItem
          ? 'bg-red-900 hover:bg-red-800 active:bg-red-700'
          : 'bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-700'
      }`}
    >
      <div className="flex flex-col gap-0.5">
        {activeTab === 'upcoming' ? (
          <span className="block text-xs font-medium text-zinc-400">
            {startDate}
          </span>
        ) : null}
        <b
          className={`block text-base font-semibold ${
            activeItem ? 'text-red-300' : 'text-zinc-400'
          }`}
        >
          {startHour.toString().padStart(2, '0')}
          {':'}
          {startMinute.toString().padStart(2, '0')}
        </b>
      </div>
      <div className="flex-1 truncate">
        <div className="flex flex-col gap-0.5">
          <div
            className={`truncate text-base ${
              activeItem ? 'text-zinc-100' : 'text-zinc-200'
            }`}
          >
            {event.name}
          </div>
          <div
            className={`truncate text-xs ${
              activeItem ? 'text-red-400' : 'text-zinc-500'
            }`}
          >
            <span>nalendrasari@gmail.com</span>
            <span>, kangalfania@gmail.com</span>
            <span>, +2 more</span>
          </div>
        </div>
      </div>
      {activeItem && now ? (
        <div>
          <b className="rounded-lg bg-red-950 px-3 py-0.5 text-[10px] font-medium leading-[14px] text-red-200">
            Now
          </b>
        </div>
      ) : null}
    </Button>
  );
};
