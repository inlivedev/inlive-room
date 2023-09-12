'use client';

import ScreenShareIcon from '@/_shared/components/icons/screen-share-icon';
import { useScreenShare } from '@/_features/room/hooks/use-screen-share';
import { useToggle } from '@/_shared/hooks/use-toggle';

export default function ButtonScreenShare() {
  const { startScreenCapture, stopScreenCapture } = useScreenShare();
  const { active, setActive, setInActive } = useToggle(false);

  const screenShareHandler = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    try {
      if (active) {
        const stopping = stopScreenCapture();
        if (stopping) setInActive();
      } else {
        const sharing = await startScreenCapture({
          audio: true,
          video: true,
        });

        if (sharing) setActive();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <button
      className={`rounded-full ${
        active ? 'bg-neutral-500' : 'bg-neutral-700'
      } p-3 text-neutral-50`}
      aria-label="Screen share"
      onClick={screenShareHandler}
    >
      <ScreenShareIcon width={24} height={24} />
    </button>
  );
}
