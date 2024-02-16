'use client';

import { useEffect, useRef } from 'react';
import type { ParticipantVideo } from '@/_features/room/contexts/participant-context';
import { useDeviceContext } from '@/_features/room/contexts/device-context';

export default function ConferenceScreenHidden({
  stream,
}: {
  stream: ParticipantVideo;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const { currentAudioOutput } = useDeviceContext();

  useEffect(() => {
    const play = async () => {
      if (!audioRef.current) {
        return;
      }

      if (
        currentAudioOutput &&
        !AudioContext.prototype.hasOwnProperty('setSinkId')
      ) {
        const sinkId =
          currentAudioOutput.deviceId !== 'default'
            ? currentAudioOutput.deviceId
            : '';

        if (
          HTMLMediaElement.prototype.hasOwnProperty('setSinkId') &&
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //@ts-ignore
          sinkId !== audioRef.current.sinkId
        ) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //@ts-ignore
          await audioRef.current.setSinkId(sinkId);
        }
      }

      audioRef.current.srcObject = stream.mediaStream;
      audioRef.current.muted = stream.origin === 'local';
      audioRef.current.autoplay = true;
    };

    play();
  }, [currentAudioOutput, stream.mediaStream, stream.origin]);

  return (
    <audio
      ref={audioRef}
      className="absolute right-[99999px] h-0 w-0 opacity-0"
    ></audio>
  );
}
