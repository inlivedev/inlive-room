import { usePeerContext } from '@/_features/room/contexts/peer-context';

export const useScreenShare = () => {
  const { peer } = usePeerContext();

  const screenShare = async (mediaConstraints: MediaStreamConstraints) => {
    try {
      if (!peer) return;

      const stream = await navigator.mediaDevices.getDisplayMedia(
        mediaConstraints
      );

      peer.addStream(stream.id, {
        id: stream.id,
        origin: 'local',
        source: 'screen',
        stream: stream,
      });
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        if (
          error.name == 'NotAllowedError' ||
          error.name == 'PermissionDeniedError'
        ) {
          alert('Please allow this website to share your screen');
        }
      }
    }
  };

  return { screenShare };
};
