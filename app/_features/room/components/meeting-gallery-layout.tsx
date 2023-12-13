import { type ParticipantStream } from '@/_features/room/contexts/participant-context';
import '../styles/meeting-gallery-layout.css';
import ConferenceScreen from './conference-screen';
import ConferenceScreenHidden from './conference-screen-hidden';

export default function MeetingGalleryLayout({
  streams,
}: {
  streams: ParticipantStream[];
}) {
  const MAX_VISIBLE_PARTICIPANTS = 49;
  const moreThanMax = streams.length > MAX_VISIBLE_PARTICIPANTS;
  const visibleParticipants = streams.slice(
    0,
    moreThanMax ? MAX_VISIBLE_PARTICIPANTS - 1 : MAX_VISIBLE_PARTICIPANTS
  );
  const hiddenParticipants = streams.slice(
    moreThanMax ? MAX_VISIBLE_PARTICIPANTS - 1 : MAX_VISIBLE_PARTICIPANTS
  );

  const maxColumns = Math.ceil(Math.sqrt(visibleParticipants.length));

  return (
    <div className="meeting-gallery-layout flex h-full w-full flex-col justify-center p-4">
      <div className="participant-container">
        <div
          className={`participant-grid grid gap-2 sm:gap-3`}
          style={{
            gridTemplateColumns: `repeat(${maxColumns}, minmax(0, 1fr))`,
          }}
        >
          {visibleParticipants.map((stream, index) => {
            return (
              <div className="participant-item" key={`stream${index}`}>
                <ConferenceScreen stream={stream} />
              </div>
            );
          })}
          {moreThanMax && (
            <div className="participant-item">
              <div className="absolute flex h-full w-full items-center justify-center rounded-lg bg-zinc-800 p-2 text-xs font-medium shadow-lg sm:text-sm">
                More <span className="hidden sm:inline">+</span>
              </div>
              {hiddenParticipants.map((stream, index) => {
                return (
                  <ConferenceScreenHidden
                    key={`hidden-screen-${index}`}
                    stream={stream}
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
