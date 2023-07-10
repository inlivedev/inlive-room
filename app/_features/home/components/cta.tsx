'use client';

import { createRoom, registerClient } from '@/_features/room/modules/factory';
import { useRouter } from 'next/navigation';

export default function HomeCTA() {
  const router = useRouter();

  const handleCreateRoom = async () => {
    try {
      const room = await createRoom();
      const client = await registerClient(room.roomId);
      window.localStorage.setItem('clientId', client.clientId);
      router.push(`/room/${room.roomId}`);
      router.refresh();
    } catch (error) {
      alert('Something went wrong. Please try again later! ');
      console.error(error);
    }
  };

  return (
    <section className="max-w-xl lg:max-w-lg">
      <h2 className="text-3xl font-bold tracking-wide lg:text-4xl">
        Conference room for real-time video and audio calls
      </h2>
      <p className="mt-4 text-base text-neutral-400 lg:text-lg">
        The alternative for Google Meet and Zoom video and audio calls. Get
        started now by creating a room or join to other rooms with room code.
      </p>
      <div className="mt-8">
        <button
          className="w-full rounded-md border border-red-700 bg-red-700 px-6 py-2 text-sm font-medium lg:w-auto"
          onClick={handleCreateRoom}
        >
          Create a new room
        </button>
      </div>
    </section>
  );
}
