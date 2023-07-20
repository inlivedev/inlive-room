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
    <div
      className="relative h-full w-full overflow-hidden rounded-md"
      style={{
        paddingBottom: 'calc(2 / 3 * 100%)',
      }}
    >
      <div className="absolute left-0 top-0 h-full w-full">
        <video
          className="absolute left-0 top-0 h-full w-full object-fill object-center"
          ref={videoRef}
        ></video>
      </div>
    </div>
  );
}
