'use client';
import { useRef } from 'react';

export default function RoomScreen() {
  const videoRef = useRef(null);

  return (
    <div className="h-full w-full ">
      <video
        className="h-full w-full object-cover"
        autoPlay
        playsInline
        muted
        ref={videoRef}
      ></video>
    </div>
  );
}
