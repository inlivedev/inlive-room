'use client';

import Heading from '@/_features/home/create-room/heading';
import SubHeading from '@/_features/home/create-room/subheading';
import CreateButton from '@/_features/home/create-room/create-button';
import { createRoom } from '@/_features/room/modules/factory';
import { useNavigate } from '@/_shared/hooks/useNavigate';

type CreateRoomProps = {
  heading: React.ReactNode;
  subHeading: React.ReactNode;
  actionButton: (handleCreateRoom: () => void) => React.ReactNode;
};

export default function CreateRoom({
  heading,
  subHeading,
  actionButton,
}: CreateRoomProps) {
  const { navigateTo } = useNavigate();

  const handleCreateRoom = () => {
    createRoom()
      .then((room) => {
        if (!room.data.roomId) {
          throw new Error('Failed to create a room. Please try again later!');
        }

        navigateTo(`/room/${room.data.roomId}`);
      })
      .catch((error) => {
        alert('Something went wrong. Please try again later! ');
        console.error(error);
      });
  };

  return (
    <section className="max-w-xl lg:max-w-lg">
      {heading}
      {subHeading}
      <div className="mt-8">{actionButton(handleCreateRoom)}</div>
    </section>
  );
}

CreateRoom.Heading = Heading;
CreateRoom.SubHeading = SubHeading;
CreateRoom.CreateButton = CreateButton;
