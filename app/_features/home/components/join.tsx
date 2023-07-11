'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerClient } from '@/_features/room/modules/factory';

export default function HomeJoin() {
  const router = useRouter();
  const [roomId, setRoomId] = useState<string>('');

  const handleInputRoomIdChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRoomId(event.target.value);
  };

  const handleJoinRoom = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    try {
      const client = await registerClient(roomId);
      window.localStorage.setItem('clientId', client.clientId);
      router.push(`/room/${roomId}`);
      router.refresh();
    } catch (error) {
      alert('Something went wrong. Please try again later! ');
      console.error(error);
    }
  };

  return (
    <form className="w-full max-w-xl rounded-md bg-neutral-800 p-6 shadow-md">
      <h3 className="text-xl font-semibold tracking-wide">Join a room</h3>
      <p className="mt-2 text-base text-neutral-400">
        Have a room code? Enter the code below in order to join to other rooms.
      </p>
      <div className="mt-8 flex flex-1 items-center justify-between gap-4">
        <input
          type="text"
          className="flex-1 rounded-md border border-neutral-600 bg-neutral-800 px-4 py-2 text-sm outline-none placeholder:text-neutral-500 focus:border-neutral-500"
          placeholder="Enter a room code"
          onChange={handleInputRoomIdChange}
        />
        <button className="text-sm font-medium" onClick={handleJoinRoom}>
          Join
        </button>
      </div>
    </form>
  );
}
