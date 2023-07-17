'use client';

import { useJoinRoom } from '@/_features/home/join-room/use-join-room';

export default function JoinField() {
  const { bindField, joinRoom } = useJoinRoom();

  return (
    <div className="mt-8 flex flex-1 items-center justify-between gap-4">
      <input
        className="flex-1 rounded-md border border-neutral-600 bg-neutral-800 px-4 py-2 text-sm outline-none placeholder:text-neutral-500 focus:border-neutral-500"
        type="text"
        placeholder="Enter a room code"
        {...bindField}
      />
      <button
        className="text-sm font-medium"
        onClick={(event) => joinRoom(event)}
      >
        Join
      </button>
    </div>
  );
}
