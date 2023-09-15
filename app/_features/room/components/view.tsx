'use client';

import Lobby from '@/_features/room/components/lobby';
import LobbyHeader from '@/_features/room/components/lobby-header';
import LobbyInvite from '@/_features/room/components/lobby-invite';
import LobbyCTA from '@/_features/room/components/lobby-cta';
import { ParticipantProvider } from '@/_features/room/contexts/participant-context';
import Conference from '@/_features/room/components/conference';
import { useToggle } from '@/_shared/hooks/use-toggle';
import { useLocalDevice } from '@/_features/room/hooks/use-local-device';
import { Mixpanel } from '@/_shared/components/analytics/mixpanel';

type ViewProps = {
  roomId: string;
  origin: string;
};

export default function View({ roomId, origin }: ViewProps) {
  const { active: openConference, setActive: setOpenConference } =
    useToggle(false);

  const { mediaStream, getUserMedia } = useLocalDevice();

  const video = (): MediaTrackConstraints => {
    const constrain = {
      width: {
        ideal: 1280,
      },
      height: {
        ideal: 720,
      },
    };

    if (
      screen.orientation.type === 'portrait-primary' ||
      screen.orientation.type === 'portrait-secondary'
    ) {
      return {
        width: {
          ideal: 720,
        },
        height: {
          ideal: 1280,
        },
      };
    }

    return {
      width: {
        ideal: 1280,
      },
      height: {
        ideal: 720,
      },
    };
  };

  const openConferenceHandler = async () => {
    await getUserMedia({
      video: video(),
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });
    setOpenConference();
    Mixpanel.track('Join room', {
      roomId: roomId,
    });
  };

  return (
    <div className="h-screen w-screen bg-neutral-900 text-neutral-200">
      {openConference && mediaStream ? (
        <ParticipantProvider localMediaStream={mediaStream}>
          <Conference />
        </ParticipantProvider>
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
