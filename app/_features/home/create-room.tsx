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
import { useAuthContext } from '@/_shared/contexts/auth';
import { useState } from 'react';
import { Mixpanel } from '@/_shared/components/analytics/mixpanel';
import type { RoomType } from '@/_shared/types/room';
import { InternalApiFetcher } from '@/_shared/utils/fetcher';

export default function CreateRoom() {
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

    if (response.code > 299 || !response.data) {
      throw new Error(response.message);
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
      if (!user || isSubmitting) return;

      setIsSubmitting(true);

      try {
        if (key === 'meeting-room') {
          const room = await createRoom('meeting');
          setIsSubmitting(false);
          window.location.href = `/room/${room.id}`;
        } else if (key === 'webinar-room') {
          const room = await createRoom('event');
          setIsSubmitting(false);
          window.location.href = `/room/${room.id}`;
        }
      } catch (error) {
        setIsSubmitting(false);
        alert('Failed to create a room. Please try again later! ');
        console.error(error);
      }
    },
    [user, isSubmitting, createRoom]
  );

  return (
    <section className="max-w-xl lg:max-w-lg">
      <h2 className="text-3xl font-bold tracking-wide lg:text-4xl">
        Virtual room for real-time video and audio calls
      </h2>
      <p className="mt-4 text-base text-zinc-400 lg:text-lg">
        An open source virtual room for messaging, video, and audio calls in
        real-time. Get started by creating a room or joining others now.
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
            <DropdownMenu onAction={onCreateRoomSelection}>
              <DropdownItem
                key="meeting-room"
                description="Suitable for personal or group meetings"
              >
                Create a room for meeting
              </DropdownItem>
              <DropdownItem
                key="webinar-room"
                description="Webinar room with speakers and audiences"
              >
                Create a room for webinar
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        ) : (
          <Button
            className="w-52 rounded-md bg-red-700 px-6 py-2 text-sm font-medium text-zinc-200 antialiased hover:bg-red-600 active:bg-red-500"
            onClick={openSignInModal}
          >
            Sign in to your account
          </Button>
        )}
      </div>
    </section>
  );
}
