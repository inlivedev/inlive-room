'use client';

import { useContext, useMemo } from 'react';
import RoomContainer from '@/_features/room/components/room-container';
import RoomScreen from '@/_features/room/components/room-screen';
import styles from '@/_features/room/styles/room.module.css';
import { Context } from '@/_features/room/modules/context';

type RoomLayoutProps = {
  roomId: string;
};

export default function RoomLayout({ roomId }: RoomLayoutProps) {
  const context = useContext(Context);

  const streams = useMemo(() => {
    console.log('context', context);
  }, [context.streams]);

  return (
    <RoomContainer roomId={roomId}>
      <div className="mx-auto flex min-h-screen w-full max-w-screen-xl flex-col">
        <div className={`w-full flex-1 p-4 ${styles['room-grid']}`}>
          <div className={`${styles['room-grid-screen']}`}>
            <RoomScreen />
          </div>
        </div>
        <div className="flex justify-center p-4">
          <button className="rounded-full bg-red-600 p-3"></button>
        </div>
      </div>
    </RoomContainer>
  );
}
