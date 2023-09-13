import merge from 'lodash-es/merge.js';
import { usePeerContext } from '@/_features/room/contexts/peer-context';

export const useScreenShare = () => {
  const { peer } = usePeerContext();

  const startScreenCapture = async (
    mediaConstraints: MediaStreamConstraints = {}
  ) => {
    try {
      if (!peer) return;

      const constraints: MediaStreamConstraints = {
        video: true,
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      };

      merge(constraints, mediaConstraints);

      const mediaStream = await navigator.mediaDevices.getDisplayMedia(
        constraints
      );

      peer.addStream(mediaStream.id, {
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
      if (!peer) return;

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
          for (const sender of peerConnection.getSenders()) {
            if (sender.track === screenTrack) {
              sender.track.stop();
              peerConnection.removeTrack(sender);
              peer.removeStream(screenStream.id);
              return true;
            }
          }
        }
      }

      return false;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  return { startScreenCapture, stopScreenCapture };
};
