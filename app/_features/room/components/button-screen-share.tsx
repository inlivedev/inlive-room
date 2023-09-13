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

      await startScreenCapture({
        audio: true,
        video: true,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <button
      className={`rounded-full ${
        screenCaptureActive ? 'bg-red-500' : 'bg-neutral-700'
      } p-3 text-neutral-50`}
      aria-label="Screen share"
      onClick={screenShareHandler}
    >
      {screenCaptureActive ? (
        <ScreenShareOffIcon width={24} height={24} />
      ) : (
        <ScreenShareOnIcon width={24} height={24} />
      )}
    </button>
  );
}
