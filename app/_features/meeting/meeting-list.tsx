'use client';
import { useEffect, useState } from 'react';
import { Button } from '@nextui-org/react';
import { InternalApiFetcher } from '@/_shared/utils/fetcher';
import type { EventType } from '@/_shared/types/event';
import Link from 'next/link';

const now = new Date();

export default function MeetingList() {
  const [activeTab, setActiveTab] = useState<'today' | 'upcoming'>('today');
  const [events, setEvents] = useState<EventType.Event[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const response: EventType.ListEventsResponse =
        await InternalApiFetcher.get(
          `/api/events?&limit=${10}&start_is_before=${now.toISOString()}&end_is_after=${now.toISOString()}&type=${'meeting'}`
        );

      if (response.data) {
        setEvents(response.data);
      }
    };

    fetchData();
  }, []);

  console.log('events', events);

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
      <ul className="mt-4 flex flex-col gap-4">
        <li>
          <MeetingItem
            active={true}
            name="Talking About Adventure Plan on Next Trip with Friends"
          />
        </li>
        <li>
          <MeetingItem
            active={false}
            name="Talking About Adventure Plan on Next Trip with Friends"
          />
        </li>
        <li>
          <MeetingItem
            active={false}
            name="Talking About Adventure Plan on Next Trip with Friends"
          />
        </li>
        <li>
          <MeetingItem
            active={false}
            name="Talking About Adventure Plan on Next Trip with Friends"
          />
        </li>
        <li>
          <MeetingItem
            active={false}
            name="Talking About Adventure Plan on Next Trip with Friends"
          />
        </li>
      </ul>
      {/* <br />
      <br />
      {events.length > 0 ? (
        <ul>
          {events.map((event) => (
            <div key={event.id}>
              {`${new Date(event.startTime)
                .getHours()
                .toString()
                .padStart(2, '0')} : ${new Date(event.startTime)
                .getMinutes()
                .toString()
                .padStart(2, '0')}`}{' '}
              {event.name}
            </div>
          ))}
        </ul>
      ) : null} */}
    </div>
  );
}

const MeetingItem = ({
  name,
  active = false,
}: {
  name: string;
  active: boolean;
}) => {
  return (
    <Button
      as={Link}
      href="/"
      className={`flex h-[66px] min-h-0 w-full min-w-0 items-center gap-4 rounded px-4 py-3 antialiased ${
        active
          ? 'bg-red-900 hover:bg-red-800 active:bg-red-700'
          : 'bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-700'
      }`}
    >
      <div>
        <b
          className={`text-base font-medium ${
            active ? 'text-red-300' : 'text-zinc-400'
          }`}
        >
          10:30
        </b>
      </div>
      <div className="flex-1 truncate">
        <div className="flex flex-col gap-0.5">
          <div
            className={`truncate text-base ${
              active ? 'text-zinc-100' : 'text-zinc-200'
            }`}
          >
            {name}
          </div>
          <div
            className={`truncate text-xs ${
              active ? 'text-red-400' : 'text-zinc-500'
            }`}
          >
            <span>nalendrasari@gmail.com</span>
            <span>, kangalfania@gmail.com</span>
            <span>, +2 more</span>
          </div>
        </div>
      </div>
      {active ? (
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
