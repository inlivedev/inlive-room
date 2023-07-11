'use client';

import { useMemo } from 'react';
import RoomScreen from '@/_features/room/components/room-screen';
import styles from '@/_features/room/styles/room.module.css';
import { useRoomContext } from '@/_features/room/modules/context';

export default function RoomLayout() {
  const context = useRoomContext();
  console.log(context.streams);

  const streams = useMemo(() => {
    const streams = context.streams;
    return Object.entries(streams).map((data) => {
      const value = data[1];
      return {
        data: value.data,
        type: value.type,
      };
    });
  }, [context.streams]);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-screen-xl flex-col">
      <div className={`w-full flex-1 p-4 ${styles['room-grid']}`}>
        {streams.map((stream) => {
          return (
            <div
              key={stream.data.id}
              className={`${styles['room-grid-screen']}`}
            >
              <RoomScreen stream={stream} />
            </div>
          );
        })}
      </div>
      <div className="flex justify-center p-4">
        <button className="rounded-full bg-red-600 p-3"></button>
      </div>
    </div>
  );
}
