import { useEffect, useRef, useState } from 'react';
import type { ParticipantStream } from '@/_features/room/contexts/participant-context';
import { useDeviceContext } from '@/_features/room/contexts/device-context';

export const useVideoScreen = (stream: ParticipantStream) => {
  const [video, setVideo] = useState<HTMLVideoElement | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { currentAudioOutput } = useDeviceContext();

  useEffect(() => {
    if (video || !videoRef.current) {
      return;
    }

    const videoElement = videoRef.current;
    if (videoElement instanceof HTMLVideoElement) {
      setVideo(videoRef.current);
    }

    return () => {
      // unmounting
    };
  }, [videoRef, video]);

  useEffect(() => {
    const isPlaying = video
      ? video.currentTime > 0 &&
        !video.paused &&
        !video.ended &&
        video.readyState > video.HAVE_CURRENT_DATA
      : false;

    if (!video || isPlaying) {
      return;
    }

    const play = async () => {
      if (currentAudioOutput && 'setSinkId' in HTMLMediaElement.prototype) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        await video.setSinkId(currentAudioOutput.deviceId);
      }

      video.srcObject = stream.mediaStream;
      video.playsInline = true;
      video.muted = stream.origin === 'local';
      video.play();
    };

    play();
  }, [stream, currentAudioOutput, video]);

  return { videoRef: videoRef };
};
