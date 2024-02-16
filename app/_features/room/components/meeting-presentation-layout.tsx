'use client';

import { useMemo } from 'react';
import { type ParticipantVideo } from '@/_features/room/contexts/participant-context';
import '../styles/meeting-presentation-layout.css';
import ConferenceScreen from '@/_features/room/components/conference-screen';
import ConferenceScreenHidden from './conference-screen-hidden';

export default function MeetingPresentationLayout({
  streams,
}: {
  streams: ParticipantVideo[];
}) {
  const MAX_VISIBLE_PARTICIPANTS = 6;

  const { spotlightScreen, visibleStreams, hiddenStreams } = useMemo(() => {
    const { screens, medias } = streams.reduce(
      (accumulator, currentValue) => {
        if (currentValue.source === 'screen') {
          return {
            ...accumulator,
            screens: [...accumulator.screens, currentValue],
          };
        } else {
          return {
            ...accumulator,
            medias: [...accumulator.medias, currentValue],
          };
        }
      },
      { screens: [] as ParticipantVideo[], medias: [] as ParticipantVideo[] }
    );

    const spotlightScreen = screens.pop();
    const visibleScreens = screens.slice(0, MAX_VISIBLE_PARTICIPANTS);
    const inVisibleScreens = screens.slice(MAX_VISIBLE_PARTICIPANTS);

    const visibleParticipants =
      visibleScreens.length < MAX_VISIBLE_PARTICIPANTS
        ? medias.slice(0, MAX_VISIBLE_PARTICIPANTS - visibleScreens.length)
        : [];
    const invisibleParticipants = medias.slice(visibleParticipants.length);

    const visibleStreams = [...visibleScreens, ...visibleParticipants];
    const hiddenStreams = [...inVisibleScreens, ...invisibleParticipants];

    return { spotlightScreen, visibleStreams, hiddenStreams };
  }, [streams]);

  const maxColumns = Math.ceil(Math.sqrt(visibleStreams.length));

  return (
    <div className="meeting-presentation-layout">
      <div className="presentation-container">
        <div className="relative h-full w-full">
          {spotlightScreen && <ConferenceScreen stream={spotlightScreen} />}
        </div>
      </div>
      <div className="participant-container">
        <div
          className={`participant-grid grid gap-3`}
          style={{
            gridTemplateColumns: `repeat(${maxColumns}, minmax(auto, 180px))`,
          }}
        >
          {visibleStreams.map((stream) => {
            return (
              <div
                className="participant-item"
                key={`visible-stream-${stream.id}`}
              >
                <ConferenceScreen stream={stream} />
              </div>
            );
          })}
          {hiddenStreams.map((stream) => {
            return (
              <ConferenceScreenHidden
                key={`hidden-screen-${stream.id}`}
                stream={stream}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
