'use client';

import { type ParticipantVideo } from '@/_features/room/contexts/participant-context';
import ConferenceScreen from '@/_features/room/components/conference-screen';

export default function MeetingOneOnOneLayout({
  streams,
}: {
  streams: ParticipantVideo[];
}) {
  const localStream = streams.find((stream) => stream.origin === 'local');
  const remoteStream = streams.find((stream) => stream.origin === 'remote');

  return (
    <div className="flex h-full w-full flex-col justify-center">
      <div className="relative flex h-full w-full flex-col justify-center">
        <div className="relative aspect-square sm:aspect-auto sm:h-full">
          {remoteStream && <ConferenceScreen stream={remoteStream} />}
        </div>
        <div className="absolute bottom-4 right-4 z-20">
          <div className="relative aspect-square w-32 sm:aspect-video sm:w-52">
            {localStream && <ConferenceScreen stream={localStream} />}
          </div>
        </div>
      </div>
    </div>
  );
}
