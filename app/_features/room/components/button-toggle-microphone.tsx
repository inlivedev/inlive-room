'use client';

import { useEffect, useRef } from 'react';
import { useToggle } from '@/_shared/hooks/use-toggle';
import MicrophoneOnIcon from '@/_shared/components/icons/microphone-on-icon';
import MicrophoneOffIcon from '@/_shared/components/icons/microphone-off-icon';
import ExpandIcon from '@/_shared/components/icons/expand-icon';
import { usePeerContext } from '@/_features/room/contexts/peer-context';

export default function ButtonToggleMicrophone() {
  const { active, toggle } = useToggle(true);
  const { peer } = usePeerContext();
  const didMount = useRef(false);

  // useEffect(() => {
  //   if (!peer) return;

  //   if (didMount.current) {
  //     if (active) {
  //       peer.turnOnMic();
  //     } else {
  //       peer.turnOffMic();
  //     }
  //   } else {
  //     didMount.current = true;
  //   }
  // }, [active, peer]);

  return (
    <div className="flex items-center text-neutral-200">
      <button
        className={`flex h-full items-center gap-2 rounded rounded-r-none bg-neutral-900 px-2.5 py-2 ring-1 ring-neutral-700 hover:bg-neutral-700 active:bg-neutral-600`}
        aria-label="Toggle Micropphone"
        onClick={toggle}
      >
        {active ? (
          <MicrophoneOnIcon width={20} height={20} />
        ) : (
          <MicrophoneOffIcon width={20} height={20} />
        )}
      </button>
      <button className="flex h-full items-center rounded rounded-l-none bg-neutral-800 p-1 text-xs ring-1 ring-neutral-700 hover:bg-neutral-700 active:bg-neutral-600">
        <ExpandIcon width={12} height={12} strokeWidth={2} />
      </button>
    </div>
  );
}
