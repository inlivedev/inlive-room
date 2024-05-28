'use client';

import { Button } from '@nextui-org/react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useNavigate } from '@/_shared/hooks/use-navigate';
import TablerArrowRightIcon from '@/_shared/components/icons/tabler-arrow-right-icon';

type JoinRoomInput = { roomID: string };

export default function JoinRoomField() {
  const { navigateTo } = useNavigate();
  const { register, handleSubmit } = useForm<JoinRoomInput>();

  const handleJoinRoom: SubmitHandler<JoinRoomInput> = async (data) => {
    const { roomID } = data;
    navigateTo(`/rooms/${roomID}`);
  };

  return (
    <form
      onSubmit={handleSubmit(handleJoinRoom)}
      className="flex items-center gap-2"
    >
      <div className="flex-1">
        <input
          className="w-full rounded-md bg-zinc-950 px-3 py-2.5 text-sm shadow-sm outline-blue-300 ring-1 ring-zinc-800 placeholder:text-zinc-500"
          type="text"
          placeholder="Enter room code"
          autoComplete="off"
          required
          {...register('roomID', { required: true })}
        />
      </div>
      <div>
        <Button
          type="submit"
          className="h-auto min-h-0 min-w-0 rounded-lg bg-zinc-800/50 px-4 py-2.5 antialiased hover:bg-zinc-800 active:bg-zinc-700"
        >
          <TablerArrowRightIcon className="h-5 w-5 text-zinc-100/50" />
        </Button>
      </div>
    </form>
  );
}
