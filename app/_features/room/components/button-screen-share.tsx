'use client';

import ScreenShareOnIcon from '@/_shared/components/icons/screen-share-on-icon';
import ScreenShareOffIcon from '@/_shared/components/icons/screen-share-off-icon';
import { useScreenShare } from '@/_features/room/hooks/use-screen-share';

export default function ButtonScreenShare() {
  const { startScreenCapture, stopScreenCapture, screenCaptureActive } =
    useScreenShare();

  const screenShareHandler = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    try {
      if (screenCaptureActive) {
        stopScreenCapture();
        return;
      }

      await startScreenCapture({ withAudio: true });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex items-center text-neutral-200">
      <button
        className={`flex h-full items-center gap-2 rounded bg-neutral-900 px-2.5 py-2 ring-1 ring-neutral-700 hover:bg-neutral-700 active:bg-neutral-600`}
        aria-label="Screen share"
        onClick={screenShareHandler}
      >
        {screenCaptureActive ? (
          <ScreenShareOffIcon width={20} height={20} />
        ) : (
          <ScreenShareOnIcon width={20} height={20} />
        )}
      </button>
    </div>
  );
}
