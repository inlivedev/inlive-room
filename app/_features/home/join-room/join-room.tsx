'use client';

import Heading from '@/_features/home/join-room/heading';
import InputRoom from '@/_features/home/join-room/input-room';
import SubHeading from '@/_features/home/join-room/subheading';
import { useNavigate } from '@/_shared/hooks/use-navigate';
import { useInput } from '@/_shared/hooks/use-input';
import JoinButton from '@/_features/home/join-room/join-button';

type JoinRoomProps = {
  heading: React.ReactNode;
  subHeading: React.ReactNode;
  inputRoom: (
    props: React.InputHTMLAttributes<HTMLInputElement>
  ) => React.ReactNode;
  actionButton: (
    handleJoinRoom: (event: React.MouseEvent<HTMLButtonElement>) => void
  ) => React.ReactNode;
};

export default function JoinRoom({
  heading,
  subHeading,
  inputRoom,
  actionButton,
}: JoinRoomProps) {
  const { navigateTo } = useNavigate();
  const { value: roomId, bindValue: bindRoomId } = useInput('');

  const handleJoinRoom = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    if (roomId.trim().length === 0) {
      throw new Error('Please enter the room code');
    }

    navigateTo(`/room/${roomId}`);
  };

  return (
    <form className="w-full max-w-xl rounded-md bg-neutral-800 p-6 shadow-md">
      {heading}
      {subHeading}
      <div className="mt-8 flex flex-1 items-center justify-between gap-4">
        {inputRoom(bindRoomId)}
        {actionButton(handleJoinRoom)}
      </div>
    </form>
  );
}

JoinRoom.Heading = Heading;
JoinRoom.SubHeading = SubHeading;
JoinRoom.InputRoom = InputRoom;
JoinRoom.JoinButton = JoinButton;
