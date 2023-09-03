'use client';

import { useEffect, useRef } from 'react';
import { useToggle } from '@/_shared/hooks/use-toggle';
import MicrophoneOnIcon from '@/_shared/components/icons/microphone-on-icon';
import MicrophoneOffIcon from '@/_shared/components/icons/microphone-off-icon';
import { usePeerContext } from '@/_features/room/contexts/peer-context';

export default function ButtonToggleMicrophone() {
  const { active, toggle } = useToggle(true);
  const { peer } = usePeerContext();
  const didMount = useRef(false);

  useEffect(() => {
    if (!peer) return;

    if (didMount.current) {
      if (active) {
        peer.enableMic();
      } else {
        peer.disableMic();
      }
    } else {
      didMount.current = true;
    }
  }, [active, peer]);

  return (
    <button
      className={`rounded-full ${
        active ? 'bg-neutral-700' : 'bg-red-500'
      } p-3 text-neutral-50`}
      aria-label="Toggle Micropphone"
      onClick={toggle}
    >
      {active ? (
        <MicrophoneOnIcon width={24} height={24} />
      ) : (
        <MicrophoneOffIcon width={24} height={24} />
      )}
    </button>
  );
}
