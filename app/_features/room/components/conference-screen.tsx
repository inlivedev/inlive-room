'use client';

import { useVideoScreen } from '@/_features/room/hooks/use-video-screen';
import type { ParticipantStream } from '@/_features/room/contexts/participant-context';

export default function ConferenceScreen({
  stream,
}: {
  stream: ParticipantStream;
}) {
  const { videoRef } = useVideoScreen(stream);

  return (
    <div className="video-screen relative rounded-lg shadow-lg">
      {/* overlay video screen */}
      <div className="absolute flex h-full w-full flex-col justify-end rounded-lg p-2">
        <div className="flex">
          <div className="video-screen-name max-w-full truncate rounded bg-zinc-900/70 px-2 py-0.5 text-xs font-medium text-zinc-200 md:text-sm">
            <span>{stream.name}</span>
          </div>
        </div>
      </div>
      <video
        className="rounded-lg object-contain object-center"
        ref={videoRef}
      ></video>
    </div>
  );
}
