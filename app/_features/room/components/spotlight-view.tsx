'use client';

import { type ParticipantVideo } from '@/_features/room/contexts/participant-context';
import ConferenceScreen from '@/_features/room/components/conference-screen';

export default function SpotlightView({
  streamA,
  streamB,
}: {
  streamA: ParticipantVideo;
  streamB?: ParticipantVideo;
}) {
  return (
    <div className="flex h-full w-full flex-col justify-center">
      <div className="relative flex h-full w-full flex-col justify-center">
        {streamA ? (
          <div className="relative aspect-square sm:aspect-auto sm:h-full">
            <ConferenceScreen stream={streamA} />
          </div>
        ) : null}
        {streamB ? (
          <div className="absolute bottom-4 right-4 z-20">
            <div className="relative aspect-square w-32 sm:aspect-video sm:w-52">
              <ConferenceScreen stream={streamB} />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
