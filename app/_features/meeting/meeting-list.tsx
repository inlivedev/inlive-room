'use client';
import React, { useState } from 'react';
import { Button } from '@nextui-org/react';
import { useFormattedDateTime } from '@/_shared/hooks/use-formatted-datetime';
import Link from 'next/link';
import ScheduleModal from '@/_features/meeting/schedule-modal';
import { UpcomingEvent } from '@/(server)/_features/event/repository';
import { useAuthContext } from '@/_shared/contexts/auth';
import { FetcherResponse, InternalApiFetcher } from '@/_shared/utils/fetcher';
import {
  EventDetails,
  EventParticipant,
} from '@/(server)/_features/event/service';

export default function MeetingList({ events }: { events: UpcomingEvent[] }) {
  const [activeTab, setActiveTab] = useState<'today' | 'upcoming'>('today');

  const { todayEvents, upcomingEvents } = events.reduce(
    (accumulator, currentValue) => {
      const now = new Date();
      const today = new Date(new Date().setHours(0, 0, 0, 0));
      const eventEndTime = new Date(currentValue.endTime);
      const eventEndDay = new Date(
        new Date(currentValue.endTime).setHours(0, 0, 0, 0)
      );

      if (eventEndDay > today) {
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
      } else if (
        eventEndDay.toDateString() === today.toDateString() &&
        eventEndTime > now
      ) {
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
      todayEvents: [] as UpcomingEvent[],
      upcomingEvents: [] as UpcomingEvent[],
    }
  );

  const activeEvents: UpcomingEvent[] = ([] =
    activeTab === 'today' ? todayEvents : upcomingEvents);

  return (
    <>
      <ScheduleModal />
      <div className="max-w-full rounded-xl bg-zinc-900 ring-1 ring-zinc-800">
        <nav className="px-4 pt-4">
          <div className="flex items-center justify-between gap-4 border-b border-zinc-800">
            <ul className="flex items-center text-sm font-medium">
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
            <Button
              className="inline-flex h-auto min-h-0 min-w-0 items-center gap-2 rounded-md bg-zinc-700 px-3 py-1.5 text-sm font-medium text-zinc-100 antialiased hover:bg-zinc-600 active:bg-zinc-500"
              onPress={() =>
                document.dispatchEvent(
                  new CustomEvent('open:schedule-meeting-modal')
                )
              }
            >
              Add schedule
            </Button>
          </div>
        </nav>
        {activeEvents.length > 0 ? (
          <div>
            <ul className="flex h-[310px] flex-col gap-4 overflow-y-auto overflow-x-hidden overscroll-contain px-4 pb-8 pt-4">
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
    </>
  );
}

const MeetingItem = ({
  event,
  activeTab,
  activeItem = false,
}: {
  event: UpcomingEvent;
  activeTab: 'today' | 'upcoming';
  activeItem?: boolean;
}) => {
  const { user } = useAuthContext();

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

  const filteredParticipant = event.participant
    .filter((participant) => participant.id !== event.host.id)
    .map((participant) => {
      if (participant.id == user!.id) {
        return {
          ...participant,
          email: 'You',
          name: 'You',
        };
      }
      return {
        ...participant,
        name: participant.name.split(' ')[0],
      };
    })
    .sort((a, b) => (a.email === 'You' ? -1 : b.email === 'You' ? 1 : 0));

  return (
    <Button
      onPress={async () => {
        document.dispatchEvent(
          new CustomEvent('open:schedule-meeting-modal-detail')
        );

        Promise.all([
          InternalApiFetcher.get(`/api/events/${event.id}`),
          InternalApiFetcher.get(`/api/events/${event.id}/details/registeree`),
        ])
          .then(([selectedEventResponse, participantsResponse]) => {
            const selectedEvent: FetcherResponse & { data: EventDetails } =
              selectedEventResponse;
            const participants: FetcherResponse & {
              data: EventParticipant[];
            } = participantsResponse;

            const customEvent = new CustomEvent('edit:schedule-meeting', {
              detail: {
                event: selectedEvent.data,
                participants: participants.data,
              },
            });

            document.dispatchEvent(customEvent);
          })
          .catch((error) => {
            console.error('Error fetching event data:', error);
          });
      }}
      className={`flex h-auto min-h-0 w-full min-w-0 items-center gap-4 rounded px-4 py-3 antialiased ${
        activeItem
          ? 'bg-red-900 hover:bg-red-800 active:bg-red-700'
          : 'bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-700'
      }`}
    >
      {/* Date */}
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
      {/* Event Title */}
      <div className="flex-1 truncate">
        <div className="flex flex-col gap-0.5">
          <div
            className={`truncate text-base ${
              activeItem ? 'text-zinc-100' : 'text-zinc-200'
            }`}
          >
            {event.name}
            <p className="truncate text-sm text-zinc-500">
              {event.host.id !== user?.id
                ? 'host: ' + event.host.name.split(' ')[0] + ' |'
                : ''}{' '}
              guest:{' '}
              {filteredParticipant
                .map((participant) => participant.name)
                .join(', ')}{' '}
            </p>
          </div>
        </div>
      </div>
      {activeItem && now ? (
        <div>
          <b className="rounded-lg bg-red-950 px-3 py-0.5 text-[10px] font-medium leading-[14px] text-red-200 hover:hidden">
            Now
          </b>
        </div>
      ) : null}
    </Button>
  );
};
