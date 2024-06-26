import type { EventType } from '@/_shared/types/event';
import { StatusPublished, StatusDraft, StatusCancelled } from './event-status';
import Link from 'next/link';
import Image from 'next/image';
import { useFormattedDateTime } from '@/_shared/hooks/use-formatted-datetime';

const APP_ORIGIN = process.env.NEXT_PUBLIC_APP_ORIGIN;

export function EventCard({ event }: { event: EventType.Event }) {
  const imagePath = event.thumbnailUrl
    ? `${APP_ORIGIN}/static${event.thumbnailUrl}`
    : '/images/webinar/webinar-no-image-placeholder.png';

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
    <Link
      href={`/events/${event.slug}/detail`}
      className="rounded-3xl border border-zinc-800 p-5 hover:bg-zinc-800/50 active:bg-zinc-800"
    >
      <div className="flex items-center gap-3 border-b border-zinc-800 pb-5">
        {(() => {
          switch (event.status) {
            case 'draft':
              return <StatusDraft />;
            case 'published':
              return <StatusPublished />;
            case 'cancelled':
              return <StatusCancelled />;
          }
        })()}
        <p className="text-xs font-medium tracking-[0.275px] text-zinc-500">
          Free
        </p>
      </div>
      <div className="mt-5 flex flex-col gap-5 sm:flex-row md:flex-col lg:flex-row">
        <div className="max-w-none flex-1 sm:order-2 sm:max-w-60 md:order-1 md:max-w-none lg:order-2 lg:max-w-60">
          <Image
            referrerPolicy="no-referrer"
            src={imagePath}
            alt={`Thumbnail image of ${event.name}`}
            loading="lazy"
            width={240}
            height={120}
            style={{ objectFit: 'cover' }}
            className="w-full rounded"
            unoptimized
          />
        </div>
        <div className="flex flex-1 flex-col justify-between sm:order-1 md:order-2 lg:order-1">
          <h3 className="line-clamp-3 text-lg font-medium text-zinc-300">
            {event.name}
          </h3>
          <div className="mt-4">
            <span className="text-sm font-medium text-zinc-500">
              <span>{eventDate}</span>,&nbsp;
              <span className="lowercase">{eventTime}</span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
