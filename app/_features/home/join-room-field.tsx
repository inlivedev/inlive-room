'use client';

import { Button } from "@heroui/react";
import { useForm, type SubmitHandler, useWatch } from 'react-hook-form';
import { useNavigate } from '@/_shared/hooks/use-navigate';
import TablerArrowRightIcon from '@/_shared/components/icons/tabler-arrow-right-icon';

type JoinRoomInput = { roomID: string };

export default function JoinRoomField() {
  const { navigateTo } = useNavigate();
  const { register, handleSubmit, control } = useForm<JoinRoomInput>();

  const handleJoinRoom: SubmitHandler<JoinRoomInput> = async (data) => {
    const { roomID } = data;
    navigateTo(`/rooms/${roomID}`);
  };

  const roomID = useWatch({ control, name: 'roomID' });
  const roomIDLength = roomID ? roomID.trim().length : 0;

  return (
    <form
      onSubmit={handleSubmit(handleJoinRoom)}
      className="flex items-center gap-2"
    >
      <div className="flex-1">
        <input
          className="w-full rounded-md bg-zinc-950 px-3 py-2.5 text-sm shadow-sm ring-1 ring-zinc-800 placeholder:text-zinc-500 focus-visible:outline-0 focus-visible:ring-zinc-100"
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
          className={`h-auto min-h-0 min-w-0 rounded-md px-4 py-2.5 antialiased !opacity-100 ${
            roomIDLength > 0 ? 'bg-zinc-800' : 'bg-zinc-800/50'
          }`}
          disabled={roomIDLength === 0}
          isDisabled={roomIDLength === 0}
          aria-disabled={roomIDLength === 0}
        >
          <TablerArrowRightIcon
            className={`h-5 w-5 ${
              roomIDLength > 0 ? 'text-zinc-100' : 'text-zinc-100/50'
            }`}
          />
        </Button>
      </div>
    </form>
  );
}
