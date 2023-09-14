import ButtonLeave from '@/_features/room/components/button-leave';
import ButtonToggleMicrophone from '@/_features/room/components/button-toggle-microphone';
import ButtonToggleCamera from '@/_features/room/components/button-toggle-camera';
import ButtonScreenShare from '@/_features/room/components/button-screen-share';

export default function ConferenceActionsBar() {
  return (
    <div className="flex h-full w-full items-center justify-center gap-4 border-t border-neutral-700 px-4 py-1.5 md:py-2.5 lg:gap-6">
      <div className="flex h-full flex-col justify-center">
        <ButtonToggleMicrophone />
      </div>
      <div className="flex h-full flex-col justify-center">
        <ButtonToggleCamera />
      </div>
      <div className="flex h-full flex-col justify-center">
        <ButtonScreenShare />
      </div>
      <div className="flex h-full flex-col justify-center">
        <ButtonLeave />
      </div>
    </div>
  );
}
