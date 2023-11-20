import ConferenceParticipants from '@/_features/room/components/conference-participants';
import ConferenceActionsBar from '@/_features/room/components/conference-actions-bar';
import styles from '@/_features/room/styles/conference.module.css';
import { useParticipantContext } from '@/_features/room/contexts/participant-context';
import { useViewportHeight } from '@/_hooks/use-viewport-height';

export default function Conference() {
  useViewportHeight();
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
    <div className="viewport-height w-full">
      <div className={`${styles['participants']} ${getClass()}`}>
        <ConferenceParticipants />
      </div>
      <div className={`${styles['actionbar']}`}>
        <ConferenceActionsBar />
      </div>
    </div>
  );
}
