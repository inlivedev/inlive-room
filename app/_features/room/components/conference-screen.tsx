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
    <div
      className="relative h-full w-full overflow-hidden rounded-md"
      style={{
        paddingBottom: 'calc(2 / 3 * 100%)',
      }}
    >
      <div className="absolute left-0 top-0 h-full w-full">
        <video
          className="absolute left-0 top-0 h-full w-full object-cover object-center"
          ref={videoRef}
        ></video>
      </div>
    </div>
  );
}
