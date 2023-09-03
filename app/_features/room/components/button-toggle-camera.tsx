'use client';

import { useEffect, useRef } from 'react';
import { useToggle } from '@/_shared/hooks/use-toggle';
import CameraOnIcon from '@/_shared/components/icons/camera-on-icon';
import CameraOffIcon from '@/_shared/components/icons/camera-off-icon';
import { usePeerContext } from '@/_features/room/contexts/peer-context';

export default function ButtonToggleCamera() {
  const { active, toggle } = useToggle(true);
  const { peer } = usePeerContext();
  const didMount = useRef(false);

  useEffect(() => {
    if (!peer) return;

    if (didMount.current) {
      if (active) {
        peer.enableCamera();
      } else {
        peer.disableCamera();
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
      aria-label="Toggle Video Camera"
      onClick={toggle}
    >
      {active ? (
        <CameraOnIcon width={24} height={24} />
      ) : (
        <CameraOffIcon width={24} height={24} />
      )}
    </button>
  );
}
