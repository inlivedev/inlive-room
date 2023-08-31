import ConferenceScreen from '@/_features/room/components/conference-screen';
import { useParticipantContext } from '@/_features/room/contexts/participant-context';
import styles from '@/_features/room/styles/conference-participants.module.css';

export default function ConferenceParticipants() {
  const { streams } = useParticipantContext();

  return (
    <div className={`${styles['participants-grid']}`}>
      {streams.map((stream) => {
        return (
          <div
            key={stream.stream.id}
            className={`${styles['participants-grid-screen']}`}
          >
            <ConferenceScreen stream={stream} />
          </div>
        );
      })}
    </div>
  );
}
