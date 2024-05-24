'use client';

import { useState, useCallback, type Key } from 'react';
import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Spinner,
} from '@nextui-org/react';
import * as Sentry from '@sentry/nextjs';
import { Mixpanel } from '@/_shared/components/analytics/mixpanel';
import type { RoomType } from '@/_shared/types/room';
import { InternalApiFetcher } from '@/_shared/utils/fetcher';
import JoinRoomField from '@/_features/home/join-room-field';
import type { AuthType } from '@/_shared/types/auth';
import MeetingList from '@/_features/meeting/meeting-list';
import ScheduleModal from '@/_features/meeting/schedule-modal';
import type { EventType } from '@/_shared/types/event';

const createRoom = async (type: string) => {
  const response: RoomType.CreateGetRoomResponse =
    await InternalApiFetcher.post('/api/rooms/create', {
      body: JSON.stringify({
        type: type,
      }),
    });

  if (!response || !response.ok) {
    throw new Error(
      `Failed to create a ${type} room. ${response?.message || ''}`
    );
  }

  const room = response.data;

  Mixpanel.track('Create room', {
    roomId: room.id,
    createdBy: room.createdBy,
  });

  return room;
};

export default function SignedIn({
  user,
  events,
}: {
  user: AuthType.CurrentAuthContext;
  events: EventType.Event[];
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const firstName = user.name.split(' ')[0];

  const onCreateRoomSelection = useCallback(
    async (key: Key) => {
      if (isSubmitting || typeof key !== 'string') return;

      if (key === 'event' || key === 'meeting') {
        try {
          setIsSubmitting(true);
          const room = await createRoom(key);
          setIsSubmitting(false);
          window.location.href = `/rooms/${room.id}`;
        } catch (error) {
          Sentry.captureException(error, {
            extra: {
              message: `API call error when trying to create ${key} room`,
            },
          });

          setIsSubmitting(false);
          alert('Failed to create a room. Please try again later! ');
          console.error(error);
        }
      }

      if (key === 'schedule') {
        document.dispatchEvent(new CustomEvent('open:schedule-meeting-modal'));
      }
    },
    [isSubmitting]
  );

  return (
    <>
      <ScheduleModal />
      <div className="grid w-full grid-cols-1 gap-y-12 pb-4 md:grid-cols-2 md:pb-0">
        <div className="flex items-center md:px-5 lg:px-10">
          <div>
            <h2 className="text-3xl font-semibold tracking-wide text-zinc-200 lg:text-4xl">
              Hi, {firstName}.
            </h2>
            <p className="mt-3 text-pretty text-base text-zinc-400 lg:text-lg">
              Get the conversation going in virtual room. Ready, set,
              collaborate!
            </p>
            <div className="mt-8">
              <Dropdown
                placement="bottom-start"
                className="ring-1 ring-zinc-800/70"
              >
                <DropdownTrigger>
                  <Button
                    className="h-auto min-h-0 min-w-0 rounded-lg bg-red-700 px-6 py-2.5 text-sm font-medium text-zinc-100 antialiased hover:bg-red-600 active:bg-red-500"
                    isDisabled={isSubmitting}
                    aria-disabled={isSubmitting}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="flex gap-2">
                        <Spinner
                          classNames={{
                            circle1: 'border-b-zinc-200',
                            circle2: 'border-b-zinc-200',
                            wrapper: 'w-4 h-4',
                          }}
                        />
                        <span>Creating a room...</span>
                      </div>
                    ) : (
                      <span>New room</span>
                    )}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  disallowEmptySelection
                  aria-label="Create a room menu"
                  onAction={onCreateRoomSelection}
                >
                  <DropdownItem key="meeting" classNames={{ wrapper: 'group' }}>
                    <div className="text-sm font-medium text-zinc-200">
                      <span className="inline-block">Meeting</span>
                    </div>
                    <div className="text-xs text-zinc-400 group-hover:text-zinc-200">
                      Personal or group meetings
                    </div>
                  </DropdownItem>
                  <DropdownItem key="event" classNames={{ wrapper: 'group' }}>
                    <div className="flex justify-between text-sm font-medium text-zinc-200">
                      <span className="inline-block">Webinar</span>
                      <div className="inline-flex items-center">
                        <span className="rounded-sm border-1 border-emerald-800 bg-emerald-950 px-1.5 text-[11px] font-medium leading-4 tracking-[0.275px] text-emerald-300">
                          Beta
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-zinc-400 group-hover:text-zinc-200">
                      Host sessions with large audiences
                    </div>
                  </DropdownItem>
                  <DropdownItem
                    key="schedule"
                    classNames={{ wrapper: 'group' }}
                  >
                    <div className="flex justify-between text-sm font-medium text-zinc-200">
                      <span className="inline-block">Schedule</span>
                      <div className="inline-flex items-center">
                        <span className="rounded-sm border-1 border-emerald-800 bg-emerald-950 px-1.5 text-[11px] font-medium leading-4 tracking-[0.275px] text-emerald-300">
                          Beta
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-zinc-400 group-hover:text-zinc-200">
                      Schedule meeting for later
                    </div>
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
            <div className="mt-8 max-w-xs">
              <p className="mb-2 text-sm text-zinc-400">
                Got a room code to join?
              </p>
              <JoinRoomField />
            </div>
          </div>
        </div>
        <div className="md:px-5 lg:px-10">
          <div className="max-w-lg">
            <MeetingList events={events} />
          </div>
        </div>
      </div>
    </>
  );
}
