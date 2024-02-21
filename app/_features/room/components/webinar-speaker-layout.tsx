'use client';

import { useMemo } from 'react';
import { type ParticipantVideo } from '@/_features/room/contexts/participant-context';
import { useMetadataContext } from '@/_features/room/contexts/metadata-context';
import ConferenceScreen from '@/_features/room/components/conference-screen';
import '../styles/webinar-speaker-layout.css';

export default function WebinarSpeakerLayout({
  streams,
}: {
  streams: ParticipantVideo[];
}) {
  const MAX_VISIBLE_PARTICIPANTS = 20;
  const { moderatorClientIDs, speakerClientIDs } = useMetadataContext();

  const {
    speakers,
    visibleParticipants,
    hiddenParticipants,
    participantsMoreThanMax,
  } = useMemo(() => {
    const { speakers, participants } = streams.reduce(
      (accumulator, currentStream) => {
        if (
          moderatorClientIDs.includes(currentStream.clientId) ||
          speakerClientIDs.includes(currentStream.clientId)
        ) {
          return {
            ...accumulator,
            speakers: [...accumulator.speakers, currentStream],
          };
        } else {
          return {
            ...accumulator,
            participants: [...accumulator.participants, currentStream],
          };
        }
      },
      {
        speakers: [] as ParticipantVideo[],
        participants: [] as ParticipantVideo[],
      }
    );

    const participantsMoreThanMax =
      participants.length > MAX_VISIBLE_PARTICIPANTS;

    const visibleParticipants = participants.slice(
      0,
      participantsMoreThanMax
        ? MAX_VISIBLE_PARTICIPANTS - 1
        : MAX_VISIBLE_PARTICIPANTS
    );

    const hiddenParticipants = participants.slice(
      participantsMoreThanMax
        ? MAX_VISIBLE_PARTICIPANTS - 1
        : MAX_VISIBLE_PARTICIPANTS
    );

    return {
      speakers,
      visibleParticipants,
      hiddenParticipants,
      participantsMoreThanMax,
    };
  }, [streams, moderatorClientIDs, speakerClientIDs]);

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
          {visibleParticipants.map((stream) => {
            return (
              <div
                key={`visible-stream-${stream.id}`}
                className="participant-item relative"
              >
                <ConferenceScreen stream={stream} />
              </div>
            );
          })}
          {participantsMoreThanMax && (
            <div className="participant-item relative">
              <div className="flex h-full w-full items-center justify-center rounded-lg bg-zinc-700/70 p-2 text-sm font-medium shadow-lg">
                More+
              </div>
              {hiddenParticipants.map((stream) => {
                return (
                  <ConferenceScreen
                    key={`hidden-stream-${stream.id}`}
                    stream={stream}
                    hidden={true}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
