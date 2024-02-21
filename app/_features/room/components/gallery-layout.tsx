'use client';

import { useMemo } from 'react';
import { type ParticipantVideo } from '@/_features/room/contexts/participant-context';
import '../styles/gallery-layout.css';
import ConferenceScreen from './conference-screen';

export default function MeetingGalleryLayout({
  streams,
}: {
  streams: ParticipantVideo[];
}) {
  const MAX_VISIBLE_PARTICIPANTS = 49;
  const moreThanMax = streams.length > MAX_VISIBLE_PARTICIPANTS;

  const { visibleParticipants, hiddenParticipants } = useMemo(() => {
    const visibleParticipants = streams.slice(
      0,
      moreThanMax ? MAX_VISIBLE_PARTICIPANTS - 1 : MAX_VISIBLE_PARTICIPANTS
    );
    const hiddenParticipants = streams.slice(
      moreThanMax ? MAX_VISIBLE_PARTICIPANTS - 1 : MAX_VISIBLE_PARTICIPANTS
    );

    return { visibleParticipants, hiddenParticipants };
  }, [streams, moreThanMax]);

  const maxColumns = Math.ceil(Math.sqrt(visibleParticipants.length));

  return (
    <div className="gallery-layout">
      <div className="participant-container">
        <div
          className={`participant-grid grid gap-2 sm:gap-3`}
          style={{
            gridTemplateColumns: `repeat(${maxColumns}, minmax(0, 1fr))`,
          }}
        >
          {visibleParticipants.map((stream) => {
            return (
              <div
                className="participant-item"
                key={`visible-stream-${stream.id}`}
              >
                <ConferenceScreen stream={stream} />
              </div>
            );
          })}
          {moreThanMax && (
            <div className="participant-item">
              <div className="absolute flex h-full w-full items-center justify-center rounded-lg bg-zinc-800 p-2 text-xs font-medium shadow-lg sm:text-sm">
                More <span className="hidden sm:inline">+</span>
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
