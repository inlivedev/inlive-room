import ButtonLeave from '@/_features/room/components/button-leave';
import ButtonToggleMicrophone from '@/_features/room/components/button-toggle-microphone';
import ButtonToggleCamera from '@/_features/room/components/button-toggle-camera';
import ButtonScreenShare from '@/_features/room/components/button-screen-share';

export default function ConferenceActionsBar() {
  return (
    <div className="flex justify-center gap-3">
      <div>
        <ButtonToggleMicrophone />
      </div>
      <div>
        <ButtonToggleCamera />
      </div>
      <div>
        <ButtonScreenShare />
      </div>
      <div>
        <ButtonLeave />
      </div>
    </div>
  );
}
