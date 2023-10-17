'use client';
import { useEffect } from 'react';
import { usePeerContext } from '@/_features/room/contexts/peer-context';
import { useParticipantContext } from '@/_features/room/contexts/participant-context';
import { hasTouchScreen } from '@/_shared/utils/has-touch-screen';

export default function EventContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  const { peer } = usePeerContext();
  const { streams } = useParticipantContext();

  useEffect(() => {
    if (!peer) return;

    const localStream = streams.find(
      (stream) => stream.origin === 'local' && stream.source === 'media'
    );

    if (!localStream) return;

    const onTurnOnCamera = () => {
      if (peer && localStream) peer.turnOnCamera();
    };

    const onTurnOffCamera = () => {
      if (peer && localStream) peer.turnOffCamera();
    };

    const onTurnOnMic = () => {
      if (peer && localStream) peer.turnOnMic();
    };

    const onTurnOffMic = () => {
      if (peer && localStream) peer.turnOffMic();
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
  }, [peer, streams]);

  useEffect(() => {
    if (!peer) return;
    const isTouchScreen = hasTouchScreen();

    const onVisibilityChange = () => {
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
