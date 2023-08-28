'use client';
import Lobby from '@/_features/room/lobby/lobby';
import LobbyHeader from '@/_features/room/lobby/lobby-header';
import LobbyInvite from '@/_features/room/lobby/lobby-invite';
import LobbyCTA from '@/_features/room/lobby/lobby-cta';
import Conference from '@/_features/room/conference/conference';
import { useToggle } from '@/_shared/hooks/use-toggle';

type ViewContainerProps = {
  roomId: string;
  clientId: string;
  origin: string;
};

export default function ViewContainer({
  roomId,
  clientId,
  origin,
}: ViewContainerProps) {
  const { active: openConference, setActive: setOpenConference } =
    useToggle(false);

  return (
    <div className="flex min-h-screen flex-col bg-neutral-900 text-neutral-200">
      {openConference ? (
        <Conference roomId={roomId} clientId={clientId} />
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
