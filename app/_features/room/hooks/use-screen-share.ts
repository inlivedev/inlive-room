import { useEffect, useCallback } from 'react';
import { usePeerContext } from '@/_features/room/contexts/peer-context';
import { useClientContext } from '@/_features/room/contexts/client-context';
import type { ParticipantVideo } from '@/_features/room/components/conference';
import { useToggle } from '@/_shared/hooks/use-toggle';
import { clientSDK, RoomEvent } from '@/_shared/utils/sdk';

export const useScreenShare = () => {
  const { peer } = usePeerContext();
  const { clientID, clientName } = useClientContext();
  const { active, setActive, setInActive } = useToggle(false);

  useEffect(() => {
    clientSDK.on(RoomEvent.STREAM_AVAILABLE, (data) => {
      if (
        data?.stream?.origin !== 'local' ||
        data?.stream?.source !== 'screen'
      ) {
        return;
      }

      setActive();
    });

    clientSDK.on(RoomEvent.STREAM_REMOVED, (data) => {
      if (
        data?.stream?.origin !== 'local' ||
        data?.stream?.source !== 'screen'
      ) {
        return;
      }

      const streams =
        peer &&
        peer.getAllStreams().filter((stream) => {
          return stream.origin === 'local' && stream.source === 'screen';
        });

      if (streams && streams.length === 0) setInActive();
    });
  }, [peer, setActive, setInActive]);

  const startScreenCapture = useCallback(
    async (config = { withAudio: true }) => {
      try {
        if (!peer) return false;

        // Check if screen capture permission is available
        if (
          !navigator.mediaDevices ||
          !navigator.mediaDevices.getDisplayMedia
        ) {
          alert('This browser does not support screen sharing.');
          return false;
        }

        // Request screen capture permission
        try {
          // We make an initial permission request
          const permission = await navigator.permissions.query({
            name: 'display-capture' as PermissionName,
          });
          if (permission.state === 'denied') {
            alert(
              'You need to allow screen sharing to continue. Please check your settings.'
            );
            return false;
          }
        } catch (permError: any) {
          // Some browsers might not support the permissions API for screen sharing
          // We'll continue anyway as getDisplayMedia will handle the permission

          console.error(
            "We couldn't check your screen sharing permissions. Error: " +
              permError.message
          );
        }

        const withAudio = config.withAudio
          ? {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            }
          : false;

        const constraints = {
          video: {
            displaySurface: 'monitor',
          },
          audio: withAudio,
          systemAudio: 'exclude',
          surfaceSwitching: 'include',
          selfBrowserSurface: 'exclude',
        };

        try {
          const mediaStream = await navigator.mediaDevices.getDisplayMedia(
            constraints
          );

          peer.addStream(mediaStream.id, {
            clientId: clientID,
            name: clientName,
            origin: 'local',
            source: 'screen',
            mediaStream: mediaStream,
          });

          return true;
        } catch (mediaError: any) {
          if (mediaError.name === 'NotAllowedError') {
            alert(
              'You need to allow screen sharing to continue. Please check your settings. Error: ' +
                mediaError.message
            );
          } else {
            alert('An unexpected error occurred. Error: ' + mediaError.message);
          }
          console.error(mediaError);
          return false;
        }
      } catch (error: any) {
        console.error(error);
        alert('An unexpected error occurred. Error: ' + error.message);
        return false;
      }
    },
    [clientID, clientName, peer]
  );

  const stopScreenCapture = useCallback(
    (specifyStream?: ParticipantVideo) => {
      try {
        if (!peer) return false;

        const peerConnection = peer.getPeerConnection();

        if (!peerConnection) return;

        const streams = peer.getAllStreams();

        const screenStreams = streams.filter((stream) => {
          if (specifyStream?.id) {
            return (
              stream.origin === 'local' &&
              stream.source === 'screen' &&
              stream.id === specifyStream.id
            );
          } else {
            return stream.origin === 'local' && stream.source === 'screen';
          }
        });

        for (const screenStream of screenStreams) {
          for (const screenTrack of screenStream.mediaStream.getTracks()) {
            for (const transceiver of peerConnection.getTransceivers()) {
              if (transceiver.sender.track === screenTrack) {
                transceiver.sender.track.stop();
                peerConnection.removeTrack(transceiver.sender);
                peer.removeStream(screenStream.id);
              }
            }
          }
        }

        return true;
      } catch (error) {
        console.error(error);
        return false;
      }
    },
    [peer]
  );

  return { startScreenCapture, stopScreenCapture, screenCaptureActive: active };
};
