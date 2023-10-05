import { useEffect } from 'react';
import { usePeerContext } from '@/_features/room/contexts/peer-context';
import { useToggle } from '@/_shared/hooks/use-toggle';
import { room } from '@/_shared/utils/sdk';

export const useScreenShare = () => {
  const { peer } = usePeerContext();
  const { active, setActive, setInActive } = useToggle(false);

  useEffect(() => {
    room.on(room.event.STREAM_ADDED, (data) => {
      if (
        data?.stream?.origin !== 'local' ||
        data?.stream?.source !== 'screen'
      ) {
        return;
      }

      setActive();
    });

    room.on(room.event.STREAM_REMOVED, (data) => {
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

  const startScreenCapture = async (config = { withAudio: true }) => {
    try {
      if (!peer) return false;

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

      const mediaStream = await navigator.mediaDevices.getDisplayMedia(
        constraints
      );

      peer.addStream(mediaStream.id, {
        clientId: peer.getClientId(),
        name: '',
        origin: 'local',
        source: 'screen',
        mediaStream: mediaStream,
      });

      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const stopScreenCapture = (specifyStream?: RoomStreamType.InstanceStream) => {
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
  };

  return { startScreenCapture, stopScreenCapture, screenCaptureActive: active };
};
