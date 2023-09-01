'use client';
import { useEffect, useRef } from 'react';

export default function Screen({ stream }: { stream: StreamStateType }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream.data;
      videoRef.current.playsInline = true;
      videoRef.current.muted = stream.type === 'local';
      videoRef.current.play();
    }
  }, [stream]);

  return (
    <video
      className="rounded-lg object-contain object-center "
      ref={videoRef}
    ></video>
  );
}
