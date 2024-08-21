'use client';

import { useMemo } from 'react';
import ConferenceScreen from '@/_features/room/components/conference-screen';
import { useMetadataContext } from '@/_features/room/contexts/metadata-context';
import { type ParticipantVideo } from '@/_features/room/components/conference';
import '../styles/webinar-presentation-layout.css';

export default function WebinarPresentationLayout({
  streams,
}: {
  streams: ParticipantVideo[];
}) {
  const { moderatorClientIDs, speakerClientIDs } = useMetadataContext();
  const MAX_VISIBLE_PARTICIPANTS = 6;

  const { spotlightScreen, visibleStreams, hiddenStreams } = useMemo(() => {
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

    const { speakerMedias, speakerScreens } = speakers.reduce(
      (accumulator, currentValue) => {
        if (currentValue.source === 'screen') {
          return {
            ...accumulator,
            speakerScreens: [...accumulator.speakerScreens, currentValue],
          };
        } else {
          return {
            ...accumulator,
            speakerMedias: [...accumulator.speakerMedias, currentValue],
          };
        }
      },
      {
        speakerScreens: [] as ParticipantVideo[],
        speakerMedias: [] as ParticipantVideo[],
      }
    );

    const spotlightScreen = speakerScreens.pop();
    const visibleSpeakerScreens = speakerScreens.slice(
      0,
      MAX_VISIBLE_PARTICIPANTS
    );
    const hiddenSpeakerScreens = speakerScreens.slice(MAX_VISIBLE_PARTICIPANTS);

    const visibleSpeakers =
      visibleSpeakerScreens.length < MAX_VISIBLE_PARTICIPANTS
        ? speakerMedias.slice(
            0,
            MAX_VISIBLE_PARTICIPANTS - visibleSpeakerScreens.length
          )
        : [];

    const hiddenSpeakers = speakerMedias.slice(visibleSpeakers.length);

    const visibleStreams = [...visibleSpeakerScreens, ...visibleSpeakers];
    const hiddenStreams = [
      ...hiddenSpeakerScreens,
      ...hiddenSpeakers,
      ...participants,
    ];

    return { spotlightScreen, visibleStreams, hiddenStreams };
  }, [streams, moderatorClientIDs, speakerClientIDs]);

  const maxColumns = Math.ceil(Math.sqrt(visibleStreams.length));

  return (
    <div className="webinar-presentation-layout">
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
              <ConferenceScreen
                key={`hidden-stream-${stream.id}`}
                stream={stream}
                hidden={true}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
