'use client';

import RoomScreen from '@/_features/room/components/room-screen';
import RoomActionsBar from '@/_features/room/components/room-actions-bar';
import styles from '@/_features/room/styles/room.module.css';

export default function RoomLayout({
  roomId,
  clientId,
  room,
  streams,
}: RoomLayoutProps) {
  if (!streams) return null;

  const newStreams = Object.entries(streams).map((data) => {
    const value = data[1];
    return {
      data: value.data,
      type: value.type,
    };
  });

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-screen-xl flex-col">
      <div className={`w-full flex-1 p-4 ${styles['room-grid']}`}>
        {newStreams
          ? newStreams.map((stream) => {
              return (
                <div
                  key={stream.data.id}
                  className={`${styles['room-grid-screen']}`}
                >
                  <RoomScreen stream={stream} />
                </div>
              );
            })
          : null}
      </div>
      <RoomActionsBar roomId={roomId} clientId={clientId} room={room} />
    </div>
  );
}
