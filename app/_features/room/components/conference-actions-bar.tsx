import ButtonLeave from '@/_features/room/components/button-leave';
import ButtonMicrophone from '@/_features/room/components/button-microphone';
import ButtonCamera from '@/_features/room/components/button-camera';
import ButtonScreenShare from '@/_features/room/components/button-screen-share';
import ButtonChat from '@/_features/room/components/button-chat';

export default function ConferenceActionsBar() {
  return (
    <div className="flex h-full w-full items-center justify-center gap-4 border-t border-neutral-700 px-4 py-1.5 md:py-2.5 lg:gap-6">
      <div className="flex h-full flex-col justify-center">
        <ButtonMicrophone />
      </div>
      <div className="flex h-full flex-col justify-center">
        <ButtonCamera />
      </div>
      <div className="hidden h-full flex-col justify-center xl:landscape:flex">
        <ButtonScreenShare />
      </div>
      <div className="flex h-full flex-col justify-center">
        <ButtonChat />
      </div>
      <div className="flex h-full flex-col justify-center">
        <ButtonLeave />
      </div>
    </div>
  );
}
