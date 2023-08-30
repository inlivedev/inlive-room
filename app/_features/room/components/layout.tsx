'use client';
import Lobby from '@/_features/room/components/lobby';
import LobbyHeader from '@/_features/room/components/lobby-header';
import LobbyInvite from '@/_features/room/components/lobby-invite';
import LobbyCTA from '@/_features/room/components/lobby-cta';
import Conference from '@/_features/room/components/conference';
import { useToggle } from '@/_shared/hooks/use-toggle';
import { useLocalDevice } from '@/_features/room/hooks/use-local-device';

type LayoutProps = {
  roomId: string;
  clientId: string;
  origin: string;
};

export default function Layout({ roomId, clientId, origin }: LayoutProps) {
  const { active: openConference, setActive: setOpenConference } =
    useToggle(false);

  const { mediaStream, getUserMedia } = useLocalDevice();

  const openConferenceHandler = async () => {
    await getUserMedia({ video: true, audio: true });
    setOpenConference();
  };

  return (
    <div className="flex min-h-screen flex-col bg-neutral-900 text-neutral-200">
      {openConference && mediaStream ? (
        <Conference
          roomId={roomId}
          clientId={clientId}
          mediaStream={mediaStream}
        />
      ) : (
        <Lobby>
          <LobbyHeader roomId={roomId} />
          <LobbyInvite roomId={roomId} origin={origin} />
          <LobbyCTA openConferenceRoom={openConferenceHandler} />
        </Lobby>
      )}
    </div>
  );
}
