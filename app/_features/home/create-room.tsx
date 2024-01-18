'use client';

import { useCallback, type Key } from 'react';
import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Spinner,
} from '@nextui-org/react';
import * as Sentry from '@sentry/nextjs';
import { useAuthContext } from '@/_shared/contexts/auth';
import { useState } from 'react';
import { Mixpanel } from '@/_shared/components/analytics/mixpanel';
import type { RoomType } from '@/_shared/types/room';
import { InternalApiFetcher } from '@/_shared/utils/fetcher';
import { whitelistFeature } from '@/_shared/utils/flag';

export default function CreateRoom({
  setWebinarAlertActive,
}: {
  setWebinarAlertActive: () => void;
}) {
  const { user } = useAuthContext();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openSignInModal = () => {
    document.dispatchEvent(new CustomEvent('open:sign-in-modal'));
  };

  const createRoom = useCallback(async (type: string) => {
    const response: RoomType.CreateJoinRoomResponse =
      await InternalApiFetcher.post('/api/room/create', {
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
  }, []);

  const onCreateRoomSelection = useCallback(
    async (key: Key) => {
      if (!user || isSubmitting || typeof key !== 'string') return;

      if (
        key === 'event' &&
        !whitelistFeature.includes('event') &&
        !user?.whitelistFeature.includes('event')
      ) {
        setWebinarAlertActive();
        return;
      }

      setIsSubmitting(true);

      try {
        const room = await createRoom(key);
        setIsSubmitting(false);
        window.location.href = `/room/${room.id}`;
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
    },
    [user, isSubmitting, createRoom, setWebinarAlertActive]
  );

  return (
    <section className="md:max-w-lg">
      <h2 className="text-3xl font-semibold tracking-wide text-zinc-200 lg:text-4xl">
        Virtual room for your real-time collaboration
      </h2>
      <p className="mt-4 text-pretty text-base text-zinc-400 lg:text-lg">
        Connect with anyone, anywhere. Host or join in seconds. It&apos;s that
        simple! Experience real-time messaging, video, and audio for seamless
        collaboration, all within open-source virtual rooms.
      </p>
      <div className="mt-8">
        {user ? (
          <Dropdown
            placement="bottom-start"
            className="ring-1 ring-zinc-800/70"
          >
            <DropdownTrigger>
              <Button
                className="w-52 rounded-md bg-red-700 px-6 py-2 text-sm font-medium text-zinc-200 antialiased hover:bg-red-600 active:bg-red-500"
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
                    <span>Creating a new room...</span>
                  </div>
                ) : (
                  <span>Create a new room</span>
                )}
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              disallowEmptySelection
              aria-label="Create a room menu"
              onAction={onCreateRoomSelection}
            >
              <DropdownItem
                key="meeting"
                classNames={{
                  wrapper: 'group',
                }}
              >
                <div className="text-sm font-medium text-zinc-200">
                  <span className="inline-block">Meeting</span>
                </div>
                <div className="text-xs text-zinc-400 group-hover:text-zinc-200">
                  Personal or group meetings
                </div>
              </DropdownItem>
              <DropdownItem
                key="event"
                classNames={{
                  wrapper: 'group',
                }}
              >
                <div className="flex justify-between text-sm font-medium text-zinc-200">
                  <span className="inline-block">Webinar</span>
                  <span className="inline-flex items-center rounded-sm border border-emerald-800 bg-emerald-950 px-1.5 text-[11px] font-medium leading-4 tracking-[0.275px] text-emerald-300">
                    Limited Beta
                  </span>
                </div>
                <div className="text-xs text-zinc-400 group-hover:text-zinc-200">
                  Host sessions with large audiences
                </div>
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        ) : (
          <Button
            className="w-52 rounded-md bg-red-700 px-6 py-2 text-sm font-medium text-zinc-200 antialiased hover:bg-red-600 active:bg-red-500"
            onClick={openSignInModal}
          >
            Sign in to try inLive Room
          </Button>
        )}
      </div>
    </section>
  );
}
