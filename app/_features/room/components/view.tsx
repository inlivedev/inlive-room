'use client';

import { useState, useMemo, useCallback } from 'react';
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
  pageId: string;
  roomId: string;
  origin: string;
};

export default function View({ pageId, roomId, origin }: ViewProps) {
  const { active: openConference, setActive: setOpenConference } =
    useToggle(false);

  const [localStream, setLocalStream] = useState<MediaStream | undefined>();

  const videoConstraints = useMemo(() => {
    if (typeof window === 'undefined') return false;

    const selectedVideoInputId = window.sessionStorage.getItem(
      'device:selected-video-input-id'
    );

    if (selectedVideoInputId) {
      return { deviceId: { exact: selectedVideoInputId } };
    }

    if (
      window.screen.orientation.type === 'portrait-primary' ||
      window.screen.orientation.type === 'portrait-secondary'
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

  const audioConstraints = useMemo(() => {
    if (typeof window === 'undefined') return false;

    const selectedAudioInputId = window.sessionStorage.getItem(
      'device:selected-audio-input-id'
    );

    const defaultConstraints = {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    };

    if (selectedAudioInputId) {
      return {
        deviceId: { exact: selectedAudioInputId },
        ...defaultConstraints,
      };
    }

    return defaultConstraints;
  }, []);

  const openConferenceHandler = useCallback(async () => {
    if (openConference) return;

    try {
      const mediaStream = await navigator.mediaDevices
        .enumerateDevices()
        .then(async (devices) => {
          const videoInput = devices.find(
            (device) => device.kind === 'videoinput'
          );
          const audioInput = devices.find(
            (device) => device.kind === 'audioinput'
          );

          if (!audioInput) {
            alert(
              `Your device needs to have an active microphone in order to continue`
            );
          }

          const mediaStream = await getUserMedia({
            video: videoInput ? videoConstraints : false,
            audio: audioConstraints,
          });

          return mediaStream;
        });

      setLocalStream(mediaStream);
      setOpenConference();

      Mixpanel.track('Join room', {
        pageId: pageId,
        roomId: roomId,
      });
    } catch (error) {
      if (error instanceof Error) {
        console.error(error);
        alert(error.message);
      }
    }
  }, [
    pageId,
    roomId,
    openConference,
    setOpenConference,
    videoConstraints,
    audioConstraints,
  ]);

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
          <LobbyHeader pageId={pageId} />
          <LobbyInvite pageId={pageId} origin={origin} />
          <LobbyCTA openConferenceRoom={openConferenceHandler} />
        </Lobby>
      )}
    </div>
  );
}
