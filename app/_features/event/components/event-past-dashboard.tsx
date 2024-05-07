'use client';

import Header from '@/_shared/components/header/header';
import { EventType } from '@/_shared/types/event';
import { Button, Image, Tab, Tabs } from '@nextui-org/react';
import Link from 'next/link';
import { StatusPublished, StatusCancelled } from './event-status';
import { useFormattedDateTime } from '@/_shared/hooks/use-formatted-datetime';
import { InternalApiFetcher } from '@/_shared/utils/fetcher';
import { useCallback, useEffect, useState } from 'react';
import ChevronLeft from '@/_shared/components/icons/chevron-left';
import ChevronRight from '@/_shared/components/icons/chevron-right';
import { EventStatCard } from './event-stat-card';
import Footer from '@/_shared/components/footer/footer';

const APP_ORIGIN = process.env.NEXT_PUBLIC_APP_ORIGIN;
export default function EventPastDashboard({
  event,
}: {
  event: EventType.Event;
}) {
  const thumbnailUrl = event.thumbnailUrl
    ? `${APP_ORIGIN}/static${event.thumbnailUrl}`
    : '/images/webinar/webinar-no-image-placeholder.png';

  const startDate = useFormattedDateTime(event.startTime, 'en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const startTime = useFormattedDateTime(event.startTime, 'en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const endTime = useFormattedDateTime(event.endTime, 'en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const durationString = getDurationString(event.startTime, event.endTime);

  const createdDate = useFormattedDateTime(event.createdAt, 'en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="bg-zinc-900">
      <div className="min-viewport-height mx-auto flex max-w-7xl flex-col px-4">
        <Header logoText="inLive Room" logoHref="/" />
        <main>
          {/*  */}
          <div>
            <Button
              as={Link}
              href="/past-events"
              className="inline-flex min-w-0 gap-2 rounded-lg bg-transparent py-2 pl-3 pr-4  antialiased hover:bg-zinc-800 active:bg-zinc-700"
            >
              <span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 lg:h-6 lg:w-6"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 12h14M5 12l6 6m-6-6l6-6"
                  />
                </svg>
              </span>
              <span className="text-sm font-medium text-white lg:text-base">
                Back to past event list
              </span>
            </Button>
          </div>
          <div className="lg:px-5">
            <div className="border-b border-zinc-800 py-4 lg:py-6">
              <div className="mb-3 flex items-center md:-mb-5">
                {event.status === 'published' && <StatusPublished />}
                {event.status === 'cancelled' && <StatusCancelled />}
                <span className="ml-3 inline-block text-sm font-medium text-zinc-500">
                  Free event
                </span>
              </div>
              <div className="flex flex-col gap-2 md:flex-row md:justify-between md:gap-5">
                <div className="md:order-2">
                  <Image
                    referrerPolicy="no-referrer"
                    src={thumbnailUrl}
                    alt={`Thumbnail image of ${event.name}`}
                    loading="lazy"
                    width={160}
                    height={80}
                    className="rounded object-cover"
                  />
                </div>
                <div className="md:order-1 md:flex-1 md:pt-7">
                  <h3 className="text-base font-medium text-zinc-300 lg:text-lg">
                    {event.name}
                  </h3>
                  <span className="mt-2 inline-block text-sm font-medium text-zinc-500">
                    <span>{startDate}</span>,&nbsp;
                    <span className="lowercase">
                      {startTime} - {endTime}
                    </span>
                    ,&nbsp;
                    <span>
                      <span className="text-zinc-400"> ({durationString})</span>
                    </span>
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-1 py-3 sm:flex-row sm:gap-8 lg:py-5">
              <div className="text-sm font-medium text-zinc-400">
                Created on {createdDate}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-2.5 lg:mt-2 lg:px-5 lg:pt-2">
            <div className="relative mt-4 block  overflow-auto">
              <Tabs
                key={'underlined'}
                variant={'underlined'}
                aria-label="tab"
                classNames={{
                  base: 'w-full',
                  tabList:
                    'gap-6 w-full relative rounded-none p-0 border-b border-divider',
                  cursor: 'w-full',
                  tab: 'max-w-fit px-0 h-12',
                }}
              >
                <Tab title={'Participants'}>
                  <ParticipantTable eventID={event.id} />
                </Tab>
                <Tab title={'Overview'} className="overflow-y-auto">
                  <EventStatCard
                    showEvent={false}
                    event={event}
                    showButton={false}
                  ></EventStatCard>
                </Tab>
              </Tabs>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}

function ParticipantTable({ eventID }: { eventID: string | number }) {
  const [isPending, setIsPending] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [participants, setParticipants] = useState<
    EventType.GetParticipantsResponse | undefined
  >(undefined);

  useEffect(() => {
    const fetchParticipants = async () => {
      InternalApiFetcher.get(
        `/api/events/${eventID}/details/participants?limit=${limit}&page=${page}`
      ).then((res) => {
        setParticipants(res);
        setIsPending(false);
      });
    };

    fetchParticipants();
    console.log();
  }, [eventID, limit, page]);

  useEffect(() => {
    console.log(participants);
  }, [participants]);

  const nextPage = useCallback(() => {
    setPage((prev) => prev + 1);
  }, []);

  const previousPage = useCallback(() => {
    setPage((prev) => prev - 1);
  }, []);

  return (
    <div
      className="max-h-[400px]
    overscroll-contain"
    >
      {isPending ? (
        <div className="flex items-center justify-center p-3 text-zinc-200 lg:p-6">
          Loading...
        </div>
      ) : !participants ? (
        <div className="flex items-center justify-center p-3 text-zinc-200 lg:p-6">
          Failed to fetch data
        </div>
      ) : (
        <div className="overflow-x-hidden">
          <div className="flex w-full flex-row items-center justify-end gap-2 py-2">
            <span className="text-sm text-zinc-300">
              Showing{' '}
              {participants.meta.per_page *
                (participants.meta.current_page - 1) +
                1}{' '}
              -{' '}
              {participants.meta.per_page * participants.meta.current_page >
              participants.meta.total_record
                ? participants.meta.total_record
                : participants.meta.per_page * participants.meta.current_page}
            </span>
            <Button
              isIconOnly
              onClick={previousPage}
              isDisabled={page <= 1}
              size="sm"
            >
              <ChevronLeft height={20} width={20} />
            </Button>
            <Button
              size="sm"
              onClick={nextPage}
              isIconOnly
              isDisabled={page >= participants.meta.total_page}
            >
              <ChevronRight height={20} width={20} />
            </Button>
          </div>
          <div className="w-full overflow-x-scroll">
            <table className="w-full table-auto divide-y divide-zinc-700 overflow-x-scroll text-left">
              <thead className="sticky top-0 bg-zinc-800 leading-5 text-zinc-300">
                <tr>
                  <th
                    scope="col"
                    className="whitespace-nowrap px-3 py-2 text-xs font-medium lg:px-6 lg:py-3"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="whitespace-nowrap px-3 py-2 text-xs font-medium lg:px-6 lg:py-3"
                  >
                    Email
                  </th>
                  <th
                    scope="col"
                    className="whitespace-nowrap px-3 py-2 text-xs font-medium lg:px-6 lg:py-3"
                  >
                    Register
                  </th>
                  <th
                    scope="col"
                    className="whitespace-nowrap px-3 py-2 text-xs font-medium lg:px-6 lg:py-3"
                  >
                    Attend
                  </th>
                  <th
                    scope="col"
                    className="whitespace-nowrap px-3 py-2 text-xs font-medium lg:px-6 lg:py-3"
                  >
                    Fully Attended
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-700 text-sm">
                {participants.data.length > 0 ? (
                  participants.data.map((participant) => {
                    return (
                      <ParticipantItem
                        key={participant.clientID}
                        participant={participant}
                      />
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={3}>
                      <div className="flex items-center justify-center p-3 text-zinc-200 lg:p-6">
                        Empty data
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function getDurationString(startTime: Date, endTime: Date) {
  const duration = Math.abs(endTime.getTime() - startTime.getTime()); // Ensure duration is positive
  const hours = Math.floor(duration / 3600000); // Convert milliseconds to hours
  const minutes = Math.floor((duration % 3600000) / 60000); // Convert the remaining milliseconds to minutes
  const seconds = Math.floor((duration % 60000) / 1000); // Convert the remaining milliseconds to seconds

  let durationString = '';
  if (hours > 0) {
    durationString += `${hours} Hour `;
  }
  if (minutes > 0 || hours > 0) {
    // Include minutes if there are hours or minutes
    durationString += `${minutes} Minutes `;
  }
  durationString += `${seconds} Seconds`;

  return durationString;
}

function ParticipantItem({
  participant,
}: {
  participant: EventType.EventParticipant;
}) {
  return (
    <tr>
      <th
        scope="row"
        className="min-w-52 max-w-80 truncate whitespace-nowrap p-3 font-medium text-zinc-200 lg:p-6"
      >
        {participant.name}
      </th>
      <td className="min-w-52 max-w-80 truncate whitespace-nowrap p-3 text-zinc-400 lg:p-6">
        {participant.email}
      </td>
      <td className="min-w-52 max-w-80 truncate whitespace-nowrap p-3 text-zinc-400 lg:p-6">
        {participant.isRegistered ? (
          <BooleanItem isTrue={participant.isRegistered}></BooleanItem>
        ) : (
          <GuestIcon />
        )}
      </td>
      <td className="min-w-52 max-w-80 truncate whitespace-nowrap p-3 text-zinc-400 lg:p-6">
        <BooleanItem isTrue={participant.isJoined}></BooleanItem>
      </td>
      <td className="min-w-52 max-w-80 truncate whitespace-nowrap p-3 text-zinc-400 lg:p-6">
        {participant.isRegistered
          ? BooleanItem({ isTrue: participant.isAttended || false })
          : null}
      </td>
    </tr>
  );
}

function BooleanItem({ isTrue }: { isTrue: boolean }) {
  return (
    <div className="flex h-fit w-fit gap-2 rounded-md px-2 py-1 ring-1 ring-zinc-800">
      <span className={isTrue ? 'text-green-800' : 'text-red-800'}>•</span>

      {isTrue ? 'Yes' : 'No'}
    </div>
  );
}

function GuestIcon() {
  return (
    <div className="flex h-fit w-fit gap-2 rounded-md px-2 py-1 ring-1 ring-zinc-800">
      Guest
    </div>
  );
}
