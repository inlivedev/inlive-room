'use client';

import Image from 'next/image';
import Header from '@/_shared/components/header/header';
import Footer from '@/_shared/components/footer/footer';
import TabNavigation from '@/_features/event/components/tab-navigation';
import { EventType } from '@/_shared/types/event';
import { selectEvent } from '@/(server)/_features/event/schema';
import CalendarIcon from '@/_shared/components/icons/calendar-icon';

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
  eventsStat,
}: {
  events?: EventType.Event[];
  eventsStat: EventType.Stat[];
}) {
  return (
    <div className="bg-zinc-900">
      <div className="min-viewport-height mx-auto flex h-full w-full max-w-7xl flex-1 flex-col  px-4">
        <Header logoText="inLive Room" logoHref="/" />
        <main className="flex-1">
          <TabNavigation navLinks={navLinks} />
          <div className="mt-5 pb-5 md:pb-10">
            {events ? (
              <>
                <ul className="flex flex-col gap-10">
                  {events.map((val, idx) => {
                    return (
                      <PastEvent
                        event={val}
                        eventStat={eventsStat[idx]}
                        key={val.id}
                      ></PastEvent>
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
        </main>
        <div>
          <Footer />
        </div>
      </div>
    </div>
  );
}

async function PastEvent({
  event,
  eventStat,
}: {
  event: selectEvent;
  eventStat: EventType.Stat;
}) {
  const APP_ORIGIN = process.env.NEXT_PUBLIC_APP_ORIGIN;

  const eventTime = new Date(event.startTime).toLocaleString('en-GB', {
    month: 'short',
    day: '2-digit',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <li className="flex flex-col gap-4 rounded-3xl border border-zinc-800 px-4 py-5 sm:p-5">
      <div className="flex flex-col gap-5 sm:flex-row sm:justify-between">
        <div className="max-w-none sm:order-2 sm:max-w-60 md:max-w-40">
          <Image
            referrerPolicy="no-referrer"
            src={
              event.thumbnailUrl
                ? `${APP_ORIGIN}/static${event.thumbnailUrl}`
                : '/images/webinar/webinar-no-image-placeholder.png'
            }
            alt={`Thumbnail image of `}
            loading="lazy"
            width={160}
            height={80}
            style={{ objectFit: 'cover' }}
            className="w-full rounded"
            unoptimized
          />
        </div>
        <div className="flex flex-col justify-between sm:order-1">
          <h3 className="text-lg font-medium text-zinc-300">${event.name}</h3>
          <div className="mt-1">
            <span className="text-sm font-medium text-zinc-500">
              ${eventTime}
            </span>
          </div>
        </div>
      </div>
      <div className="border-t border-zinc-800 pb-2 pt-4">
        <StatList>
          <StatItem
            name="Registered users"
            value={eventStat.data.registeredUsers}
          />
          <StatItem
            name="Joined users"
            value={eventStat.data.joinedGuests + eventStat.data.joinedGuests}
          />
          <StatItem
            name="Joined as guest"
            value={eventStat.data.joinedGuests}
          />
          <StatItem
            name="Percentage joined"
            value={eventStat.data.percentageJoined}
          />
          <StatItem
            name="Percentage guest"
            value={eventStat.data.percentageGuest}
          />
          <StatItem name="Duration" value="1 hr 7 min" />
          <StatItem name="Shared screen" value="25 min" />
          <StatItem name="Chat messages" value={18} />
        </StatList>
      </div>
    </li>
  );
}

function StatList({ children }: { children?: React.ReactNode }) {
  return <ul className="grid grid-cols-2 gap-8 md:grid-cols-4">{children}</ul>;
}

function StatItem({ name, value }: { name: string; value: number | string }) {
  return (
    <li>
      <dl className="flex flex-col gap-1">
        <dt className="text-sm font-semibold text-zinc-400">{name}</dt>
        <dd className="text-2xl font-semibold tabular-nums leading-6 text-zinc-200">
          {value}
        </dd>
      </dl>
    </li>
  );
}
