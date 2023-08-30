'use client';

import { useEffect, useState } from 'react';
import RoomLayout from '@/_features/room/components/room-layout';
import { MediaManager } from '@/_features/room/modules/media';
import { EventManager } from '@/_features/room/modules/event';
import { Room } from '@/_features/room/modules/room';
import { Mixpanel } from '@/_shared/components/analytics/mixpanel';

const hubOrigin = process.env.NEXT_PUBLIC_HUB_ORIGIN;
const apiVersion = process.env.NEXT_PUBLIC_API_VERSION;
const hubBaseURL = `${hubOrigin}/${apiVersion}`;

export default function RoomContainer({
  roomId,
  clientId,
}: RoomContainerProps) {
  const [streams, setStreams] = useState<RoomStreamsStateType | null>(null);
  const [room, setRoom] = useState<Room | null>(null);

  useEffect(() => {
    if (roomId && clientId && !room) {
      (async () => {
        const mediaStream = await MediaManager.getUserMedia({
          video: true,
          audio: true,
        });

        const room = new Room({
          roomId: roomId,
          clientId: clientId,
          baseUrl: hubBaseURL,
          media: new MediaManager(mediaStream, 'media'),
          event: new EventManager(),
        });

        setRoom(room);

        Mixpanel.track('Join room', {
          roomId: roomId,
        });
      })();
    }
  }, [roomId, clientId, room]);

  useEffect(() => {
    if (room) {
      room.on(Room.PARTICIPANT_ADDED, (data) => {
        const stream: MediaStream = data.stream || {};
        const type: string = data.type;
        const source: string = data.source;

        setStreams((prevState) => {
          const newStreams = Object.assign({}, prevState, {
            [stream.id]: {
              data: stream,
              type: type,
              source: source,
            },
          });

          return newStreams;
        });
      });

      room.on(Room.PARTICIPANT_REMOVED, (data) => {
        const stream: MediaStream = data.stream || {};

        setStreams((prevState) => {
          const newStreams = prevState || {};
          delete newStreams[stream.id];
          return Object.assign({}, newStreams);
        });
      });

      if (streams) return;

      room.connect();
    }
  }, [room, streams]);

  return (
    <div className="bg-neutral-900 text-neutral-200">
      <RoomLayout
        roomId={roomId}
        clientId={clientId}
        streams={streams}
        room={room}
      />
    </div>
  );
}
