'use client';

import { useEffect, useState } from 'react';
import { MediaManager } from '@/_features/room/modules/media';
import { EventManager } from '@/_features/room/modules/event';
import { Room } from '@/_features/room/modules/room';
import { RoomContext } from '@/_features/room/modules/context';

type RoomClientProps = {
  roomId: string;
  clientId: string;
  children: React.ReactNode;
};

const hubOrigin = process.env.NEXT_PUBLIC_HUB_ORIGIN;
const apiVersion = process.env.NEXT_PUBLIC_API_VERSION;
const hubBaseURL = `${hubOrigin}/${apiVersion}`;

export default function RoomContainer({
  roomId,
  clientId,
  children,
}: RoomClientProps) {
  const [streams, setStreams] = useState({});
  const [room, setRoom] = useState<Room | null>(null);

  useEffect(() => {
    if (roomId && clientId) {
      (async () => {
        const mediaStream = await MediaManager.getUserMedia({
          video: true,
          audio: true,
        });

        const room = new Room({
          roomId: roomId,
          clientId: clientId,
          baseUrl: hubBaseURL,
          media: new MediaManager(mediaStream),
          event: new EventManager(),
        });

        setRoom(room);

        room.on(Room.ROOM_TRACK_ADDED, (event) => {
          const stream: MediaStream = event.stream || {};
          const type: string = event.type;

          setStreams((prevState) => {
            return {
              ...prevState,
              [stream.id]: {
                data: stream,
                type: type,
              },
            };
          });
        });

        room.init();
      })();
    }
  }, [roomId, clientId]);

  return (
    <RoomContext.Provider value={{ streams: streams, room: room }}>
      {children}
    </RoomContext.Provider>
  );
}
