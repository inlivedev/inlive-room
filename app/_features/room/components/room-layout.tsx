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

  let hasScreen = false;

  let mediaCount = 0;

  const newStreams = Object.entries(streams).map((data) => {
    const value = data[1];
    if (value.source === 'screen') {
      hasScreen = true;
    } else {
      mediaCount++;
    }

    return {
      data: value.data,
      type: value.type,
      source: value.source,
    };
  });

  const layout = (isPresenting: boolean) => {
    if (isPresenting) {
      return {
        gridTemplateRows: `repeat(${mediaCount}, 1fr)`,
      };
    }
  };

  const videoLayout = (isPresenting: boolean, source: string) => {
    if (isPresenting) {
      if (source === 'screen') {
        return {
          gridRow: `1/span ${mediaCount}`,
        };
      }
    }
  };

  return (
    <div className={`${styles['container']} h-screen w-screen`}>
      <div
        className={`${
          styles[hasScreen ? 'presenting' : 'gallery']
        } row-start-1 w-full p-4 ${styles['media']}`}
        style={layout(hasScreen)}
      >
        {newStreams
          ? newStreams.map((stream) => {
              return (
                <div
                  key={stream.data.id}
                  className={`${
                    hasScreen
                      ? stream.source === 'screen'
                        ? styles['presenting-screen']
                        : styles['presenting-media']
                      : styles['gallery-media']
                  }`}
                  style={videoLayout(hasScreen, stream.source)}
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
