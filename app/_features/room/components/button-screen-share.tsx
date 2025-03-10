'use client';

import { Button } from '@heroui/react';
import ScreenShareOnIcon from '@/_shared/components/icons/screen-share-on-icon';
import ScreenShareOffIcon from '@/_shared/components/icons/screen-share-off-icon';
import { useScreenShare } from '@/_features/room/hooks/use-screen-share';
import { useRef } from 'react';

export default function ButtonScreenShare() {
  const { startScreenCapture, stopScreenCapture, screenCaptureActive } =
    useScreenShare();

  const agent = typeof window !== 'undefined' ? window.navigator.userAgent : '';
  const isSafari = useRef(/^((?!chrome|android).)*safari/i.test(agent));

  const screenShareHandler = () => {
    if (screenCaptureActive) {
      stopScreenCapture();
      return;
    }

    // Safari-specific implementation
    if (typeof window !== 'undefined' && isSafari.current) {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        alert('This browser does not support screen sharing.');
        return;
      }

      // For Safari, directly call getDisplayMedia without awaiting
      navigator.mediaDevices
        .getDisplayMedia({
          video: true,
          audio: true,
        })
        .then((mediaStream) => {
          startScreenCapture(mediaStream);
        })
        .catch((error) => {
          console.error('Safari screen sharing error:', error);
          alert('Screen sharing failed: ' + error.message);
        });

      return;
    }

    // Non-Safari implementation
    handleNonSafariScreenShare();
  };

  const handleNonSafariScreenShare = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        alert('This browser does not support screen sharing.');
        return false;
      }

      try {
        const permission = await navigator.permissions.query({
          name: 'display-capture' as PermissionName,
        });
        if (permission.state === 'denied') {
          alert('You need to allow screen sharing to continue.');
          return false;
        }
      } catch (permError) {
        // Permissions API might not be supported, continue anyway
      }

      const constraints = {
        video: {
          displaySurface: 'monitor',
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      };

      try {
        const mediaStream = await navigator.mediaDevices.getDisplayMedia(
          constraints
        );
        await startScreenCapture(mediaStream);
        return true;
      } catch (mediaError: any) {
        console.error(mediaError);
        alert('Screen sharing failed: ' + mediaError.message);
        return false;
      }
    } catch (error: any) {
      console.error(error);
      alert('An unexpected error occurred: ' + error.message);
      return false;
    }
  };

  return (
    <Button
      isIconOnly
      variant="flat"
      aria-label={`Toggle screen share ${screenCaptureActive ? 'off' : 'on'}`}
      className="bg-zinc-700/70 hover:bg-zinc-600 active:bg-zinc-500"
      onPress={screenShareHandler}
    >
      {screenCaptureActive ? (
        <ScreenShareOffIcon width={20} height={20} />
      ) : (
        <ScreenShareOnIcon width={20} height={20} />
      )}
    </Button>
  );
}
