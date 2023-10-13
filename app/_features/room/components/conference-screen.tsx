'use client';

import { useVideoScreen } from '@/_features/room/hooks/use-video-screen';
import type { ParticipantStream } from '@/_features/room/contexts/participant-context';
import { usePeerContext } from '@/_features/room/contexts/peer-context';
import styles from '@/_features/room/styles/conference.module.css';
import { useEffect } from 'react';

export default function ConferenceScreen({
  stream,
}: {
  stream: ParticipantStream;
}) {
  const { videoRef } = useVideoScreen(stream);
  const { peer } = usePeerContext();

  useEffect(() => {
    const videoEl = videoRef.current;
    if (videoEl && stream.origin === 'remote') peer?.observeVideo(videoEl);

    return () => {
      if (videoEl && stream.origin === 'remote') peer?.unobserveVideo(videoEl);
    };
  });

  return (
    <div className={`${styles['video-screen']} relative rounded-lg shadow-lg`}>
      {/* video screen overlay */}
      <div className="absolute z-10 flex h-full w-full flex-col justify-end rounded-lg p-2">
        <div className="flex">
          <div
            className={`${styles['video-screen-name']} max-w-full truncate rounded bg-zinc-900/70 px-2 py-0.5 text-xs font-medium text-zinc-200 md:text-sm`}
          >
            <span>{stream.name}</span>
          </div>
        </div>
      </div>
      <video
        className="aspect-video h-full rounded-lg object-cover object-center"
        ref={videoRef}
      ></video>
    </div>
  );
}
