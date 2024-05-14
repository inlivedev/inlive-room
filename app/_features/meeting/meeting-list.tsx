import { selectEvent } from '@/(server)/_features/event/schema';
import { Button } from '@nextui-org/react';
import Link from 'next/link';

type MeetingListProps = {
  events: selectEvent[];
};

export default function MeetingList(eventProps: MeetingListProps) {
  const currentIndex: number = getCurrentEvents(eventProps.events);

  return (
    <div>
      {eventProps.events.map((event, idx) =>
        idx === currentIndex ? (
          <MeetingItem event={event} key={event.id} highlight={true} />
        ) : (
          <MeetingItem event={event} key={event.id} />
        )
      )}
    </div>
  );
}

function getCurrentEvents(events: selectEvent[]) {
  return 0;
}

function MeetingItem({
  event,
  highlight = false,
}: {
  event: selectEvent;
  highlight?: boolean;
}) {
  return (
    <Button
      as={Link}
      href={`/events/${event.slug}`}
      target="_blank"
      className={`flex flex-row items-center justify-between gap-2 rounded-md p-4 text-zinc-300 sm:min-h-16 ${
        highlight ? 'bg-red-800' : 'bg-zinc-800'
      } ${highlight ? `z-10 -m-2 -mb-4` : `mt-2`}`}
    >
      <p className="text-nowrap">{`${event.startTime.getHours()} : ${event.startTime.getMinutes()}`}</p>
      <h2 className="flex-1 truncate">{event.name}</h2>

      {highlight && (
        <div className="inline-flex h-min items-center rounded-sm bg-zinc-950 px-2 py-0.5 text-xs font-medium tracking-[0.275px] text-zinc-300 outline outline-1 outline-zinc-800">
          now
        </div>
      )}
    </Button>
  );
}
