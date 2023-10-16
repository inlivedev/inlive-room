'use client';
import { useEffect } from 'react';
import { usePeerContext } from '@/_features/room/contexts/peer-context';
import { hasTouchScreen } from '@/_shared/utils/has-touch-screen';

export default function EventContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  const { peer } = usePeerContext();

  useEffect(() => {
    const onTurnOnCamera = () => {
      if (peer) peer.turnOnCamera();
    };

    const onTurnOffCamera = () => {
      if (peer) peer.turnOffCamera();
    };

    const onTurnOnMic = () => {
      if (peer) peer.turnOnMic();
    };

    const onTurnOffMic = () => {
      if (peer) peer.turnOffMic();
    };

    document.addEventListener('trigger:turnon-camera', onTurnOnCamera);
    document.addEventListener('trigger:turnoff-camera', onTurnOffCamera);
    document.addEventListener('trigger:turnon-mic', onTurnOnMic);
    document.addEventListener('trigger:turnoff-mic', onTurnOffMic);

    return () => {
      document.removeEventListener('trigger:turnon-camera', onTurnOnCamera);
      document.removeEventListener('trigger:turnoff-camera', onTurnOffCamera);
      document.removeEventListener('trigger:turnon-mic', onTurnOnMic);
      document.removeEventListener('trigger:turnoff-mic', onTurnOffMic);
    };
  }, [peer]);

  useEffect(() => {
    const onVisibilityChange = () => {
      const isTouchScreen = hasTouchScreen();

      if (document.visibilityState === 'hidden' && isTouchScreen && peer) {
        document.dispatchEvent(new CustomEvent('trigger:turnoff-camera'));
        document.dispatchEvent(new CustomEvent('trigger:turnoff-mic'));
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [peer]);

  return <>{children}</>;
}
