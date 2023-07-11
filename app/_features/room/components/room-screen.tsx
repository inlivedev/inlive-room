'use client';
import { useEffect, useRef } from 'react';
import { StreamStateType } from '@/_features/room/modules/context';

export default function RoomScreen({ stream }: { stream: StreamStateType }) {
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
    <div className="h-full w-full ">
      <video className="h-full w-full object-cover" ref={videoRef}></video>
    </div>
  );
}
