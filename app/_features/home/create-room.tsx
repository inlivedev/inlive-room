'use client';

import { Button, Spinner } from '@nextui-org/react';
import { useAuthContext } from '@/_contexts/auth';
import { useState } from 'react';
import { Mixpanel } from '@/_components/analytics/mixpanel';
import type { RoomType } from '@/_types/room';
import { InternalApiFetcher } from '@/_utils/fetcher';

export default function CreateRoom() {
  const { user } = useAuthContext();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createRoom = async (name?: string) => {
    if (!isSubmitting) {
      setIsSubmitting(true);

      try {
        const response: RoomType.CreateJoinRoomResponse =
          await InternalApiFetcher.post('/api/room/create', {
            body: JSON.stringify({
              name: name,
            }),
          });

        if (response.code > 299 || !response.data) {
          throw new Error(response.message);
        }

        const roomData = response.data;

        Mixpanel.track('Create room', {
          roomId: roomData.id,
          createdBy: roomData.createdBy,
        });

        window.location.href = `/room/${roomData.id}`;
      } catch (error) {
        setIsSubmitting(false);
        alert('Failed to create a room. Please try again later! ');

        if (error instanceof Error) {
          console.log(`Failed when decoding request response : ${error}`);
        } else {
          console.log(`Failed when decoding request response`);
        }
      }
    }
  };

  const handleCreateRoom = async () => {
    if (user) {
      createRoom();
    } else {
      document.dispatchEvent(new CustomEvent('open:sign-in-modal'));
    }
  };

  return (
    <section className="max-w-xl lg:max-w-lg">
      <h2 className="text-3xl font-bold tracking-wide lg:text-4xl">
        Virtual room for real-time video and audio calls
      </h2>
      <p className="mt-4 text-base text-zinc-400 lg:text-lg">
        An open source virtual room for messaging, video, and audio calls in
        real-time. Get started by creating a room or joining others now.
      </p>
      <div className="mt-8 ">
        <Button
          variant="flat"
          className="w-full rounded-md bg-red-700 px-6 py-2 text-sm text-zinc-200 hover:bg-red-600 active:bg-red-500 lg:w-auto"
          onClick={handleCreateRoom}
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
      </div>
    </section>
  );
}
