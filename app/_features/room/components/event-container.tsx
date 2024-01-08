'use client';
import { useEffect } from 'react';
import { usePeerContext } from '@/_features/room/contexts/peer-context';
import { hasTouchScreen } from '@/_shared/utils/has-touch-screen';

declare global {
  interface Window {
    enableDebug: () => void;
    disableDebug: () => void;
  }
}

export default function EventContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  const { peer, debug } = usePeerContext();

  useEffect(() => {
    if (!peer) return;
    console.log('event container');
    console.log('peer', peer);

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
    if (!peer) return;

    const isTouchScreen = hasTouchScreen();

    const onWindowBlur = () => {
      if (isTouchScreen && peer) {
        document.dispatchEvent(new CustomEvent('trigger:turnoff-camera'));
        document.dispatchEvent(new CustomEvent('trigger:turnoff-mic'));
      }
    };

    window.addEventListener('blur', onWindowBlur);

    return () => {
      window.removeEventListener('blur', onWindowBlur);
    };
  }, [peer]);

  useEffect(() => {
    const peerConnection = peer?.getPeerConnection();

    if (!peer || !peerConnection) return;

    let dispatcherInterval: ReturnType<typeof setInterval> | undefined =
      undefined;

    const enableDebug = () => {
      const peerConnection = peer?.getPeerConnection();
      if (!peer || !peerConnection) return;

      if (typeof dispatcherInterval !== 'undefined') {
        clearInterval(dispatcherInterval);
        dispatcherInterval = undefined;
      }

      dispatcherInterval = setInterval(() => {
        document.dispatchEvent(new CustomEvent('enable:debug-webrtc-stats'));
      }, 1500);
    };

    const disableDebug = () => {
      if (typeof dispatcherInterval !== 'undefined') {
        clearInterval(dispatcherInterval);
        dispatcherInterval = undefined;
      }

      document.dispatchEvent(new CustomEvent('disable:debug-webrtc-stats'));
    };

    window.enableDebug = enableDebug;
    window.disableDebug = disableDebug;

    if (debug) {
      enableDebug();
    }

    return () => {
      clearInterval(dispatcherInterval);
      dispatcherInterval = undefined;
    };
  }, [peer, debug]);

  return <>{children}</>;
}
