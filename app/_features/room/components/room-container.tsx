'use client';

import { useEffect, useState } from 'react';
import { useLocalStorage } from '@/_shared/hooks/useLocalStorage';
import { MediaManager, StreamsType } from '@/_features/room/modules/media';
import { EventManager } from '@/_features/room/modules/event';
import { Room } from '@/_features/room/modules/room';
import { Context } from '@/_features/room/modules/context';

type RoomClientProps = {
  roomId: string;
  children: React.ReactNode;
};

const hubOrigin = process.env.NEXT_PUBLIC_HUB_ORIGIN;
const hubVersion = process.env.NEXT_PUBLIC_HUB_VERSION;
const hubBaseURL = `${hubOrigin}/${hubVersion}`;

export default function RoomContainer({ roomId, children }: RoomClientProps) {
  const { value: clientId } = useLocalStorage<string>('clientId', '');
  const [streams, setStreams] = useState<StreamsType>({});
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

        console.log('room', room);

        room.on(Room.ROOM_TRACK_ADDED, (event) => {
          console.log('room track');
          const data = event.data || {};
          const stream = data.stream || {};
          setStreams(stream);
        });

        setRoom(room);
      })();
    }
  }, [roomId, clientId]);

  return (
    <Context.Provider value={{ streams: streams, room: room }}>
      {children}
    </Context.Provider>
  );
}
