import { useState } from 'react';

export const useLocalDevice = () => {
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  const getUserMedia = async (mediaConstraints: MediaStreamConstraints) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(
        mediaConstraints
      );

      setMediaStream(stream);
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        if (
          error.name == 'NotAllowedError' ||
          error.name == 'PermissionDeniedError'
        ) {
          alert(
            'Please allow this website to use your camera and microphone before continue'
          );
        }
      }
    }
  };

  return { getUserMedia, mediaStream };
};
