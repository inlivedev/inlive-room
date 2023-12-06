'use client';

import { useMemo } from 'react';
import { Button } from '@nextui-org/react';
import ScreenShareOnIcon from '@/_shared/components/icons/screen-share-on-icon';
import ScreenShareOffIcon from '@/_shared/components/icons/screen-share-off-icon';
import { useScreenShare } from '@/_features/room/hooks/use-screen-share';
import { useClientContext } from '@/_features/room/contexts/client-context';
import { useMetadataContext } from '@/_features/room/contexts/metadata-context';

export default function ButtonScreenShare() {
  const { startScreenCapture, stopScreenCapture, screenCaptureActive } =
    useScreenShare();

  const { clientID } = useClientContext();
  const { host, speakers } = useMetadataContext();

  const isSpeaker = useMemo(() => {
    return speakers.includes(clientID) || host.clientIDs.includes(clientID);
  }, [speakers, host, clientID]);

  const screenShareHandler = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();

    if (!isSpeaker) return;

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
      isDisabled={!isSpeaker}
      disabled={!isSpeaker}
      aria-disabled={!isSpeaker}
    >
      {screenCaptureActive ? (
        <ScreenShareOffIcon width={20} height={20} />
      ) : (
        <ScreenShareOnIcon width={20} height={20} />
      )}
    </Button>
  );
}
