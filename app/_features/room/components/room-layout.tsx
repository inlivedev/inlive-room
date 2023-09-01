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

  let screenCount = 0;

  const totalMedias: number = Object.entries(streams).length - 1;

  const screens: Array<StreamStateType> = [];
  const medias: Array<StreamStateType> = [];

  Object.entries(streams).map((data) => {
    const value = data[1];
    const obj = {
      data: value.data,
      type: value.type,
      source: value.source,
    };

    if (value.source === 'screen') {
      screens.push(obj);
      hasScreen = true;
    } else {
      mediaCount++;
      medias.push(obj);
    }
  });

  const isMobile = () => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 768;
    }
  };

  const layout = (isPresenting: boolean) => {
    if (isPresenting) {
      return isMobile()
        ? {
            gridTemplateColumns: `repeat(${totalMedias}, 1fr)`,
          }
        : {
            gridTemplateRows: `repeat(${totalMedias}, 1fr)`,
          };
    }
  };

  const videoLayout = (isPresenting: boolean, source: string) => {
    if (isPresenting) {
      if (source === 'screen') {
        screenCount++;

        if (screenCount === 1) {
          return isMobile()
            ? {
                gridColumn: `1/span ${totalMedias}`,
              }
            : {
                gridRow: `1/span ${totalMedias}`,
              };
        }
        return {
          gridRow: `auto/auto`,
          gridColumn: `2/auto`,
          minHeight: 0,
          height: '100%',
        };
      }
    }
  };

  const renderVideo = (stream: StreamStateType) => {
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
  };

  return (
    <div className={`${styles['container']} h-screen w-screen`}>
      <div
        className={`${
          styles[hasScreen ? 'presenting' : 'gallery']
        } row-start-1 w-full p-4 ${styles['media']}`}
        style={layout(hasScreen)}
      >
        {screens ? screens.map(renderVideo) : null}
        {medias ? medias.map(renderVideo) : null}
      </div>
      <RoomActionsBar roomId={roomId} clientId={clientId} room={room} />
    </div>
  );
}
