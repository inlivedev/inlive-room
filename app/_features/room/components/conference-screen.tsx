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
    <video
      className="rounded-lg object-contain object-center "
      ref={videoRef}
    ></video>
  );
}
