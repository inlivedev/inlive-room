'use client';

import ScreenShareOnIcon from '@/_shared/components/icons/screen-share-on-icon';
import ScreenShareOffIcon from '@/_shared/components/icons/screen-share-off-icon';
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
        active ? 'bg-red-500' : 'bg-neutral-700'
      } p-3 text-neutral-50`}
      aria-label="Screen share"
      onClick={screenShareHandler}
    >
      {active ? (
        <ScreenShareOffIcon width={24} height={24} />
      ) : (
        <ScreenShareOnIcon width={24} height={24} />
      )}
    </button>
  );
}
