'use client';
import Lobby from '@/_features/room/lobby/lobby';
import LobbyHeader from '@/_features/room/lobby/lobby-header';
import LobbyInvite from '@/_features/room/lobby/lobby-invite';
import LobbyCTA from '@/_features/room/lobby/lobby-cta';
import Conference from '@/_features/room/conference/conference';
import { useToggle } from '@/_shared/hooks/use-toggle';
import { useEffect } from 'react';

type RoomLayoutProps = {
  roomId: string;
  host: boolean;
  origin: string;
  deleteHostCookie(): void;
};

export default function Layout({
  roomId,
  host,
  origin,
  deleteHostCookie,
}: RoomLayoutProps) {
  const { active: openConference, setActive: setOpenConference } =
    useToggle(host);

  useEffect(() => {
    deleteHostCookie();
  }, [deleteHostCookie]);

  return (
    <div className="bg-neutral-900 text-neutral-200">
      {openConference ? (
        <Conference />
      ) : (
        <Lobby>
          <LobbyHeader roomId={roomId} />
          <LobbyInvite roomId={roomId} origin={origin} />
          <LobbyCTA openConferenceRoom={setOpenConference} />
        </Lobby>
      )}
    </div>
  );
}
