import ConferenceScreen from '@/_features/room/components/conference-screen';
import { type ParticipantStream } from '@/_features/room/contexts/participant-context';
import '../styles/conference-presentation.css';
import { useMetadataContext } from '@/_features/room/contexts/metadata-context';

export default function ConferencePresentationLayout({
  isModerator,
  streams,
}: {
  isModerator: boolean;
  streams: ParticipantStream[];
}) {
  const { host, speakers: speakerClientIDs } = useMetadataContext();

  const { medias, screens } = streams.reduce(
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
    { medias: [] as ParticipantStream[], screens: [] as ParticipantStream[] }
  );

  const latestScreen = screens.pop();

  const speakers = medias.filter((stream) => {
    return (
      (host.clientIDs.includes(stream.clientId) && stream.source === 'media') ||
      (speakerClientIDs.includes(stream.clientId) && stream.source === 'media')
    );
  });

  return (
    <div className="conference-layout presentation">
      <div className="presentation-container">
        <div className="relative h-full w-full">
          {latestScreen && (
            <ConferenceScreen isModerator={isModerator} stream={latestScreen} />
          )}
        </div>
      </div>
      <div className="users-container">
        <div className="speaker-container">
          <div className="speaker-grid">
            {speakers.map((speaker, index) => {
              return (
                <div key={`speaker${index}`} className="relative">
                  <ConferenceScreen
                    isModerator={isModerator}
                    stream={speaker}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
