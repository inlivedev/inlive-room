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
              if (
                transceiver.sender.track &&
                transceiver.sender.track.id === screenTrack.id
              ) {
                transceiver.sender.track.stop();
                peerConnection.removeTrack(transceiver.sender);
                peer.removeStream(screenStream.id);
                transceiver.stop();
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

  const startScreenCapture = useCallback(
    async (mediaStream: MediaStream) => {
      mediaStream.getTracks().forEach((track) => {
        track.addEventListener('ended', () => {
          stopScreenCapture();
        });
      });

      try {
        if (!peer) return false;
        peer.addStream(mediaStream.id, {
          clientId: clientID,
          name: clientName,
          origin: 'local',
          source: 'screen',
          mediaStream: mediaStream,
        });
      } catch (error: any) {
        stopScreenCapture();
        throw new Error(error.message);
      }
    },
    [clientID, clientName, peer, stopScreenCapture]
  );

  return { startScreenCapture, stopScreenCapture, screenCaptureActive: active };
};
