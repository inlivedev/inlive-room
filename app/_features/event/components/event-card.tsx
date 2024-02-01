import { EventType } from '@/_shared/types/event';
import { Card, CardBody, CardHeader, Divider, Image } from '@nextui-org/react';

import { useNavigate } from '@/_shared/hooks/use-navigate';
import { useCallback } from 'react';
import { StatusPublished, StatusDraft } from './event-status';

const APP_ORIGIN = process.env.NEXT_PUBLIC_APP_ORIGIN;

export function EventCard({
  event,
}: {
  event: EventType.ListEventsResponse['data'][0];
}) {
  const { navigateTo } = useNavigate();
  const eventTime = new Date(event.startTime).toLocaleString('en-GB', {
    month: 'short',
    day: '2-digit',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const onEventCard = useCallback(() => {
    navigateTo(new URL(`/event/${event.slug}`, window.location.origin).href);
  }, [navigateTo, event.slug]);

  return (
    <Card
      className="z-0 items-center ring-1 ring-zinc-800"
      isPressable
      shadow="none"
      onPress={onEventCard}
    >
      <CardHeader className="flex justify-between gap-x-2">
        {event.isPublished ? <StatusPublished /> : <StatusDraft />}
        <p className="text-xs text-zinc-500">
          Free • No participants limit • Join without register
        </p>
      </CardHeader>
      <Divider className="w-[calc(100%-1.5em)]" />
      <CardBody className="flex flex-row justify-between gap-2">
        <div className="text-ballance flex basis-1/2 flex-col justify-between">
          <h2 className="text-ballance font-bold">{event.name}</h2>
          <p className="text-xs text-zinc-500">{eventTime}</p>
        </div>
        <div>
          <Image
            className="rounded-sm "
            height={120}
            width={240}
            alt="a poster related to the event"
            style={{
              aspectRatio: '2/1',
              zIndex: 1,
              objectFit: 'contain',
            }}
            fallbackSrc="/images/general-og.png"
            src={`${APP_ORIGIN}/static/assets/images/event/${event.id}/poster.webp`}
          ></Image>
        </div>
      </CardBody>
    </Card>
  );
}
