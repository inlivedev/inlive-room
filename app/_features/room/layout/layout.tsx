'use client';
import Lobby from '@/_features/room/lobby/lobby';
import Conference from '@/_features/room/conference/conference';
import { useToggle } from '@/_shared/hooks/use-toggle';
import { useEffect } from 'react';

type RoomLayoutProps = {
  roomId: string;
  host: boolean;
  deleteHostCookie(): void;
};

export default function Layout({
  roomId,
  host,
  deleteHostCookie,
}: RoomLayoutProps) {
  const { active: openConference, setActive: setOpenConference } =
    useToggle(host);

  useEffect(() => {
    deleteHostCookie();
  }, [deleteHostCookie]);

  return (
    <div className="flex min-h-screen flex-col bg-neutral-900 text-neutral-200">
      {openConference ? (
        <Conference />
      ) : (
        <Lobby setOpenConference={setOpenConference} />
      )}
    </div>
  );
}
