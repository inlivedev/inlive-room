'use client';
import Image from 'next/image';
import { EventType } from '@/_shared/types/event';
import { selectEvent } from '@/(server)/_features/event/schema';
import { useEffect, useState } from 'react';
import { InternalApiFetcher } from '@/_shared/utils/fetcher';
import { Link } from '@nextui-org/react';

export function EventStatCard({ event }: { event: selectEvent }) {
  const APP_ORIGIN = process.env.NEXT_PUBLIC_APP_ORIGIN;

  const [stat, setStat] = useState<undefined | EventType.Stat>(undefined);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    const fetchStat = () => {
      if (new Date(event.endTime) > new Date()) {
        setIsPending(true);
        return;
      }

      InternalApiFetcher.get(`/api/events/${event.id}/stat`, {
        method: 'GET',
      }).then((stat: EventType.Stat) => {
        setStat(stat);
        setIsPending(false);
      });
    };

    fetchStat();
  }, [event]);

  const eventTime = new Date(event.startTime).toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <li>
      <Link
        href={`/events/${event.slug}/stat`}
        className="flex flex-col gap-4 rounded-3xl border border-zinc-800 p-5 px-4 hover:bg-zinc-800/50 active:bg-zinc-800 sm:p-5"
      >
        {/* Header */}
        <div className="flex w-full flex-col gap-5 sm:flex-row sm:justify-between">
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
            <h3 className="text-lg font-medium text-zinc-300">{event.name}</h3>
            <div className="mt-1">
              <span
                className="text-sm font-medium text-zinc-500"
                suppressHydrationWarning
              >
                {eventTime}
              </span>
            </div>
          </div>
        </div>
        {/* Content */}
        <div className="w-full border-t border-zinc-800 pb-2 pt-4">
          {isPending ? (
            <div className="text-center">
              <span className="text-sm font-medium text-zinc-500">
                {"Event is still ongoing, come back when it's finished."}
              </span>
            </div>
          ) : stat ? (
            <>
              <StatList>
                <StatItem
                  name="Registered users"
                  value={stat.data.registeredUsers}
                />
                <StatItem
                  name="Joined users"
                  value={stat.data.joinedGuests + stat.data.joinedGuests}
                />
                <StatItem
                  name="Joined as guest"
                  value={stat.data.joinedGuests}
                />
                <StatItem
                  name="Percentage joined"
                  value={`${stat.data.percentageJoined}%`}
                />
                <StatItem
                  name="Percentage guest"
                  value={`${stat.data.percentageGuest}%`}
                />
              </StatList>
            </>
          ) : (
            <div className="text-center">
              <span className="text-sm font-medium text-zinc-500">
                {'Retrieving stats... If took too long, please refresh.'}
              </span>
            </div>
          )}
        </div>
      </Link>
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
