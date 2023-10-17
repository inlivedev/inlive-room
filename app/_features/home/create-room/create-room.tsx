'use client';

import { useCreateRoom } from '@/_features/home/create-room/use-create-room';
import { Button, Spinner } from '@nextui-org/react';
import { useAuthContext } from '@/_shared/contexts/auth';

export default function CreateRoom() {
  const { user } = useAuthContext();
  const { createRoom, isSubmitting } = useCreateRoom();

  const handleCreateRoom = async () => {
    if (user) {
      createRoom();
    } else {
      document.dispatchEvent(new CustomEvent('open:sign-in-modal'));
    }
  };

  return (
    <>
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
    </>
  );
}
