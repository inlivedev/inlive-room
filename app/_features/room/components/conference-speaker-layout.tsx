'use client';

import { useMemo } from 'react';
import ConferenceScreen from '@/_features/room/components/conference-screen';
import { type ParticipantStream } from '@/_features/room/contexts/participant-context';
import '../styles/conference-speaker.css';
import { useMetadataContext } from '@/_features/room/contexts/metadata-context';

export default function ConferenceSpeakerLayout({
  streams,
}: {
  streams: ParticipantStream[];
}) {
  const { moderatorClientIDs, speakerClientIDs } = useMetadataContext();

  const speakers = useMemo(() => {
    return streams.filter((stream) => {
      return (
        (moderatorClientIDs.includes(stream.clientId) &&
          stream.source === 'media') ||
        (speakerClientIDs.includes(stream.clientId) &&
          stream.source === 'media')
      );
    });
  }, [streams, moderatorClientIDs, speakerClientIDs]);

  const participants = useMemo(() => {
    return streams.filter((stream) => {
      return (
        !moderatorClientIDs.includes(stream.clientId) &&
        !speakerClientIDs.includes(stream.clientId) &&
        stream.source === 'media'
      );
    });
  }, [streams, moderatorClientIDs, speakerClientIDs]);

  const MAX_VISIBLE_PARTICIPANTS = 20;
  const slicedParticipants = participants.slice(0, MAX_VISIBLE_PARTICIPANTS);

  return (
    <div className="conference-layout speaker">
      <div className="speaker-container">
        {speakers.map((speaker) => {
          return (
            <div key={`speaker-${speaker.id}`} className="relative">
              <ConferenceScreen stream={speaker} />
            </div>
          );
        })}
      </div>
      <div className="participant-container">
        <div className="participant-grid">
          {slicedParticipants.map((participant) => {
            return (
              <div
                key={`participant-${participant.id}`}
                className="participant-item relative"
              >
                <ConferenceScreen stream={participant} />
              </div>
            );
          })}
          {participants.length > MAX_VISIBLE_PARTICIPANTS && (
            <div className="participant-item relative">
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
