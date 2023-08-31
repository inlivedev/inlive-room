import ConferenceParticipants from '@/_features/room/components/conference-participants';
import ConferenceActionsBar from '@/_features/room/components/conference-actions-bar';

export default function Conference() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col">
        <div className={`grid flex-1 grid-cols-1 p-4`}>
          <ConferenceParticipants />
        </div>
        <div className="p-4">
          <ConferenceActionsBar />
        </div>
      </div>
    </div>
  );
}
