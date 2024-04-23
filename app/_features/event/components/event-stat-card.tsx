'use client';
import Image from 'next/image';
import { EventType } from '@/_shared/types/event';
import { selectEvent } from '@/(server)/_features/event/schema';
import { useEffect, useState } from 'react';
import { InternalApiFetcher } from '@/_shared/utils/fetcher';
import { useFormattedDateTime } from '@/_shared/hooks/use-formatted-datetime';
import { Button, Tooltip } from '@nextui-org/react';
import InfoIcon from '@/_shared/components/icons/info-icon';
import Link from 'next/link';

export function EventStatCard({
  event,
  showEvent = true,
  showButton = true,
}: {
  event: selectEvent;
  showEvent: boolean;
  showButton: boolean;
}) {
  const APP_ORIGIN = process.env.NEXT_PUBLIC_APP_ORIGIN;

  const [stat, setStat] = useState<undefined | EventType.GetStatsResponse>(
    undefined
  );
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    const fetchStat = () => {
      if (new Date(event.endTime) > new Date()) {
        setIsPending(true);
        return;
      }

      InternalApiFetcher.get(`/api/events/${event.id}/stat`, {
        method: 'GET',
      }).then((stat: EventType.GetStatsResponse) => {
        setStat(stat);
        setIsPending(false);
      });
    };

    fetchStat();
  }, [event]);

  const eventDate = useFormattedDateTime(event.startTime, 'en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const eventTime = useFormattedDateTime(event.startTime, 'en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <div>
      <div
        className={`flex flex-col gap-4 ${
          showEvent ? 'rounded-3xl border border-zinc-800 p-5 px-4 sm:p-5' : ''
        } `}
      >
        {/* Header */}
        {showEvent && (
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
              <h3 className="text-lg font-medium text-zinc-300">
                {event.name}
              </h3>
              <div className="mt-1">
                <span className="text-sm font-medium text-zinc-500">
                  <span>{eventDate}</span>,&nbsp;
                  <span className="lowercase">{eventTime}</span>
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div
          className={`w-full ${
            showEvent ? 'border-t' : ''
          } border-zinc-800 pb-2 pt-4`}
        >
          {' '}
          {isPending ? (
            <div className="text-center">
              <span className="text-sm font-medium text-zinc-500">
                {"Event is still ongoing, come back when it's finished."}
              </span>
            </div>
          ) : stat?.data ? (
            <>
              <StatList>
                <StatItem
                  name="Registered"
                  value={stat.data.count.registered}
                />
                <StatItem name="Attended" value={stat.data.count.attended} />
                <StatItem
                  name="Fully Attended"
                  value={stat.data.count.fullyAttended}
                />

                <StatItem
                  name="Percentage Attended"
                  value={`${stat.data.percentage.attended || 0} %`}
                ></StatItem>

                <StatItem
                  name="Percentage Fully Attended"
                  value={`${stat.data.percentage.fullyAttended || 0} %`}
                  message="≥ 80% session duration"
                ></StatItem>
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

        {showButton && (
          <div className="start-end flex w-full border-t border-zinc-700 pb-6 pt-4">
            <Button
              as={Link}
              href={`/past-events/${event.slug}`}
              target="_blank"
              className="h-9 w-full min-w-0 rounded-md bg-red-700 px-4 py-2 text-base font-medium text-white antialiased hover:bg-red-600 active:bg-red-500 lg:text-sm"
            >
              View Detailed Stats
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function StatList({ children }: { children?: React.ReactNode }) {
  return <ul className="grid grid-cols-2 gap-8 md:grid-cols-4">{children}</ul>;
}

function StatItem({
  name,
  value,
  message,
}: {
  name: string;
  value: number | string;
  message?: string;
}) {
  return (
    <li>
      <div className="flex flex-row justify-between gap-2">
        <dl className="flex flex-col gap-1">
          <dt className="text-sm font-semibold text-zinc-400">{name}</dt>
          <dd className="text-2xl font-semibold tabular-nums leading-6 text-zinc-200">
            {value}
          </dd>
        </dl>
        {message && (
          <Tooltip content={message}>
            <Button isIconOnly size="sm">
              <InfoIcon />
            </Button>
          </Tooltip>
        )}
      </div>
    </li>
  );
}
