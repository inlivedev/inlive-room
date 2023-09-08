import ConferenceParticipants from '@/_features/room/components/conference-participants';
import ConferenceActionsBar from '@/_features/room/components/conference-actions-bar';
import styles from '@/_features/room/styles/conference.module.css';

export default function Conference() {
  return (
    <div className={`mx-auto grid h-screen w-screen ${styles['conference']}`}>
      <div className={`${styles['participants']}`}>
        <ConferenceParticipants />
      </div>
      <div className={`${styles['actionbar']}`}>
        <ConferenceActionsBar />
      </div>
    </div>
  );
}
