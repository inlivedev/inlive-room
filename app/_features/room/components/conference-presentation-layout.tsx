'use client';

import { useMemo } from 'react';
import ConferenceScreen from '@/_features/room/components/conference-screen';
import { type ParticipantStream } from '@/_features/room/contexts/participant-context';
import '../styles/conference-presentation.css';
import { useMetadataContext } from '@/_features/room/contexts/metadata-context';

export default function ConferencePresentationLayout({
  streams,
}: {
  streams: ParticipantStream[];
}) {
  const { moderatorIDs, speakers: speakerClientIDs } = useMetadataContext();
  const MAX_VISIBLE_SPEAKERS = 8;

  const speakers = useMemo(() => {
    return streams.filter((stream) => {
      return (
        (moderatorIDs.includes(stream.clientId) && stream.source === 'media') ||
        (speakerClientIDs.includes(stream.clientId) &&
          stream.source === 'media')
      );
    });
  }, [streams, moderatorIDs, speakerClientIDs]);

  const screens = useMemo(() => {
    return streams.filter((stream) => {
      return stream.source === 'screen';
    });
  }, [streams]);

  const latestScreen = screens.pop();

  const slicedSpeakers = useMemo(() => {
    return [
      ...screens,
      ...speakers.slice(0, MAX_VISIBLE_SPEAKERS - screens.length),
    ];
  }, [screens, speakers]);

  return (
    <div className="conference-layout presentation">
      <div className="presentation-container">
        <div className="relative h-full w-full">
          {latestScreen && <ConferenceScreen stream={latestScreen} />}
        </div>
      </div>
      <div className="speaker-container">
        <div className="speaker-grid">
          {slicedSpeakers.map((speaker) => {
            return (
              <div
                key={`speaker-${speaker.id}`}
                className="speaker-grid-item relative"
              >
                <ConferenceScreen stream={speaker} />
              </div>
            );
          })}
          {speakers.length > MAX_VISIBLE_SPEAKERS && (
            <div className="speaker-grid-item relative">
              <div className="flex h-full w-full items-center justify-center rounded-lg bg-zinc-700/70 p-2 text-sm font-medium shadow-lg">
                More+
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
