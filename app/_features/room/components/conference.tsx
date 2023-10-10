import ConferenceParticipants from '@/_features/room/components/conference-participants';
import ConferenceActionsBar from '@/_features/room/components/conference-actions-bar';
import styles from '@/_features/room/styles/conference.module.css';
import { useParticipantContext } from '@/_features/room/contexts/participant-context';

export default function Conference() {
  const { streams } = useParticipantContext();

  const hasScreen = (): boolean => {
    return Object.values(streams).some((stream) => stream.source === 'screen');
  };

  const getClass = (): string => {
    const streamCount = Object.keys(streams).length;
    if (streamCount === 2) {
      return styles['oneonone'];
    } else if (hasScreen()) {
      return styles['presentation'];
    }

    return '';
  };

  return (
    <div className="h-screen w-screen">
      <div className={`${styles['participants']} ${getClass()}`}>
        <ConferenceParticipants />
      </div>
      <div className={`${styles['actionbar']}`}>
        <ConferenceActionsBar />
      </div>
    </div>
  );
}
