'use client';

import { useState, useMemo } from 'react';
import Lobby from '@/_features/room/components/lobby';
import LobbyHeader from '@/_features/room/components/lobby-header';
import LobbyInvite from '@/_features/room/components/lobby-invite';
import LobbyCTA from '@/_features/room/components/lobby-cta';
import { DeviceProvider } from '@/_features/room/contexts/device-context';
import { ParticipantProvider } from '@/_features/room/contexts/participant-context';
import Conference from '@/_features/room/components/conference';
import { useToggle } from '@/_shared/hooks/use-toggle';
import { getUserMedia } from '@/_shared/utils/get-user-media';
import { Mixpanel } from '@/_shared/components/analytics/mixpanel';

type ViewProps = {
  roomId: string;
  origin: string;
};

export default function View({ roomId, origin }: ViewProps) {
  const { active: openConference, setActive: setOpenConference } =
    useToggle(false);

  const [localStream, setLocalStream] = useState<MediaStream | undefined>();

  const videoConstraints = useMemo(() => {
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
  }, []);

  const openConferenceHandler = async () => {
    const mediaStream = await getUserMedia({
      video: videoConstraints,
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    setLocalStream(mediaStream);
    setOpenConference();

    Mixpanel.track('Join room', {
      roomId: roomId,
    });
  };

  return (
    <div className="flex flex-1 flex-col bg-neutral-900 text-neutral-200">
      {openConference && localStream ? (
        <DeviceProvider localStream={localStream}>
          <ParticipantProvider localStream={localStream}>
            <Conference />
          </ParticipantProvider>
        </DeviceProvider>
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
