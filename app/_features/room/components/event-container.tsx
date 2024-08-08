'use client';
import { useEffect } from 'react';
import { usePeerContext } from '@/_features/room/contexts/peer-context';

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
