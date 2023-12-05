import ConferenceScreen from '@/_features/room/components/conference-screen';
import { type ParticipantStream } from '@/_features/room/contexts/participant-context';
import '../styles/conference-speaker.css';
import { useMetadataContext } from '@/_features/room/contexts/metadata-context';

export default function ConferenceSpeakerLayout({
  isModerator,
  medias,
}: {
  isModerator: boolean;
  medias: ParticipantStream[];
}) {
  const { host, speakers: speakerClientIDs } = useMetadataContext();

  const speakers = medias.filter((stream) => {
    return (
      host.clientIDs.includes(stream.clientId) ||
      speakerClientIDs.includes(stream.clientId)
    );
  });

  const participants = medias.filter((stream) => {
    return (
      !host.clientIDs.includes(stream.clientId) &&
      !speakerClientIDs.includes(stream.clientId)
    );
  });

  const MAX_PARTICIPANTS = 20;
  const slicedParticipants = participants.slice(0, MAX_PARTICIPANTS);

  return (
    <div className="conference-layout speaker">
      <div className="speaker-container">
        {speakers.map((speaker, index) => {
          return (
            <div key={`speaker${index}`} className="relative">
              <ConferenceScreen stream={speaker} isModerator={isModerator} />
            </div>
          );
        })}
      </div>
      <div className="participant-container">
        <div className="participant-grid">
          {slicedParticipants.map((participant, index) => {
            return (
              <div
                key={`participant${index}`}
                className="participant-item relative"
              >
                <ConferenceScreen
                  stream={participant}
                  isModerator={isModerator}
                />
              </div>
            );
          })}
          {participants.length > MAX_PARTICIPANTS && (
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
