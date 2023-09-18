'use client';

import { Button } from '@nextui-org/react';
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
    <Button
      isIconOnly
      variant="flat"
      aria-label={`Toggle screen share ${screenCaptureActive ? 'off' : 'on'}`}
      className="bg-zinc-700/70 hover:bg-zinc-600 active:bg-zinc-500"
      onClick={screenShareHandler}
    >
      {screenCaptureActive ? (
        <ScreenShareOffIcon width={20} height={20} />
      ) : (
        <ScreenShareOnIcon width={20} height={20} />
      )}
    </Button>
  );
}
