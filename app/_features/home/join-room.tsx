'use client';

import { useInput } from '@/_shared/hooks/use-input';

export default function JoinRoom() {
  const { value: roomId, bindValue: bindField } = useInput('');

  const joinRoom = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    if (roomId.trim().length === 0) {
      throw new Error('Please enter the room code');
    }

    window.location.href = `/room/${roomId}`;
  };

  return (
    <form className="w-full max-w-xl rounded-md bg-zinc-800 p-6 shadow-md">
      <h3 className="text-xl font-semibold tracking-wide">Join a room</h3>
      <p className="mt-2 text-base text-zinc-400">
        Have a room code? Enter the code below in order to join to other rooms.
      </p>
      <div className="mt-8 flex flex-1 items-center justify-between gap-4">
        <div className="flex-1">
          <input
            className="w-full rounded-md border border-zinc-600 bg-zinc-800 px-4 py-2 text-sm outline-none placeholder:text-zinc-500 focus:border-zinc-500"
            type="text"
            placeholder="Enter a room code"
            {...bindField}
          />
        </div>
        <button
          className="text-sm font-medium"
          onClick={(event) => joinRoom(event)}
        >
          Join
        </button>
      </div>
    </form>
  );
}
