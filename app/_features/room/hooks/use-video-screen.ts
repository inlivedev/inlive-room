import { useEffect, useRef } from 'react';
import type { ParticipantStream } from '@/_features/room/contexts/participant-context';

export const useVideoScreen = (stream: ParticipantStream) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream.stream;
      videoRef.current.playsInline = true;
      videoRef.current.muted = stream.origin === 'local';
      videoRef.current.play();
    }
  }, [stream]);

  return { videoRef: videoRef };
};
