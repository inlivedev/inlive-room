'use client';
import { Button } from '@nextui-org/react';
import { useInput } from '@/_shared/hooks/use-input';
import { useNavigate } from '@/_shared/hooks/use-navigate';

export default function JoinRoom() {
  const { value: roomId, bindValue: bindField } = useInput('');
  const { navigateTo } = useNavigate();

  const joinRoom = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    if (roomId.trim().length === 0) {
      alert('Please enter the room code');
      return;
    }

    navigateTo(`/room/${roomId}`);
  };

  return (
    <form className="rounded-2xl border border-zinc-950 bg-zinc-950/25 p-6 lg:p-8">
      <p className="text-base font-medium text-zinc-400">
        Got a room code to join? Put it in here.
      </p>
      <div className="mt-4 flex items-center gap-2">
        <div className="flex-1">
          <input
            className="w-full rounded-md bg-zinc-950 px-4 py-2.5 text-sm shadow-sm outline-blue-300 placeholder:text-zinc-500"
            type="text"
            placeholder="Enter room code"
            {...bindField}
          />
        </div>
        <div>
          <Button
            className="flex w-full min-w-0 items-center gap-2 rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium antialiased hover:bg-zinc-700 active:bg-zinc-600"
            onClick={(event) => joinRoom(event)}
          >
            Join now
          </Button>
        </div>
      </div>
    </form>
  );
}
