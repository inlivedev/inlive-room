'use client';

import ScreenShareIcon from '@/_shared/components/icons/screen-share-icon';
import { useScreenShare } from '@/_features/room/hooks/use-screen-share';

export default function ButtonScreenShare() {
  const { screenShare } = useScreenShare();

  const screenShareHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    screenShare();
  };

  return (
    <button
      className="rounded-full bg-neutral-700 p-3 text-neutral-50"
      aria-label="Screen share"
      onClick={screenShareHandler}
    >
      <ScreenShareIcon width={24} height={24} />
    </button>
  );
}
