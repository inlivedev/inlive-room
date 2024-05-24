'use client';
import { useState, useMemo } from 'react';
import { Button } from '@nextui-org/react';
import type { EventType } from '@/_shared/types/event';
import { useFormattedDateTime } from '@/_shared/hooks/use-formatted-datetime';
import Link from 'next/link';

export default function MeetingList({ events }: { events: EventType.Event[] }) {
  const [activeTab, setActiveTab] = useState<'today' | 'upcoming'>('today');

  const { todayEvents, upcomingEvents } = useMemo(() => {
    return events.reduce(
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
  }, [events]);

  const activeEvents = activeTab === 'today' ? todayEvents : upcomingEvents;

  return (
    <div className="max-w-full rounded-xl bg-zinc-900 p-4 ring-1 ring-zinc-800">
      <nav className="border-b border-zinc-800 text-sm font-medium">
        <ul className="flex items-center">
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
        <ul className="mt-4 flex flex-col gap-4">
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
      ) : null}
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
  activeItem: boolean;
}) => {
  const startTime = new Date(event.startTime);
  const startDate = useFormattedDateTime(event.startTime, 'en-GB', {
    month: 'short',
    day: 'numeric',
  });

  const startHour = startTime.getHours();
  const startMinute = startTime.getMinutes();

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
      {activeItem ? (
        <div>
          <b className="rounded-lg bg-red-950 px-3 py-0.5 text-[10px] font-medium leading-[14px] text-red-200">
            Now
          </b>
        </div>
      ) : null}
    </Button>
  );
};

// import { Button } from '@nextui-org/react';
// import Link from 'next/link';

// export default function MeetingList() {
//   const [events, setEvents] = useState<EventType.Event[]>([]);
//   const now = new Date();

//   return (
//     <div className="m-4">
//       {(!events || events.length === 0) && (
//         <div className="flex w-full flex-col">
//           <Button
//             disabled={true}
//             className="z-10 -m-4 mt-2 items-center justify-center rounded-md bg-red-800 p-4 text-zinc-300 sm:min-h-16"
//           >
//             No meetings available
//           </Button>

//           <Button
//             disabled={true}
//             className="mt-2 flex  items-center justify-center  rounded-md bg-zinc-800 p-4 text-zinc-300 sm:min-h-16"
//           >
//             Your future meetings will appear here
//           </Button>
//         </div>
//       )}
// <MeetingItem
//   event={event}
//
//   ongoing={new Date(event.startTime) < now}
// />
//     </div>
//   );
// }

// function MeetingItem({
//   event,
//   ongoing = false,
// }: {
//   event: selectEvent;
//   ongoing?: boolean;
// }) {
//   return (
//     <Button
//       as={Link}
//       href={`/rooms/${event.roomId}`}
//       target="_blank"
//       className={`mt-2 flex flex-row items-center justify-between gap-2 rounded-md bg-zinc-800 p-4 text-zinc-300
//         first:z-10  first:-m-2 first:bg-red-800
//        first:shadow-md sm:min-h-16 sm:first:-mb-4`}
//     >
//       <p className="text-nowrap">
//         {`${new Date(event.startTime)
//           .getHours()
//           .toString()
//           .padStart(2, '0')} : ${new Date(event.startTime)
//           .getMinutes()
//           .toString()
//           .padStart(2, '0')}`}
//       </p>
//       <h2 className="flex-1 truncate">{event.name}</h2>

//       {ongoing && (
//         <div className="inline-flex h-min items-center rounded-sm bg-zinc-950 px-2 py-0.5 text-xs font-medium tracking-[0.275px] text-zinc-300 outline outline-1 outline-zinc-800">
//           now
//         </div>
//       )}
//     </Button>
//   );
// }
