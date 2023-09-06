'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { InstanceStream } from '@/_shared/sdk/room/stream/stream-types';
import { usePeerContext } from '@/_features/room/contexts/peer-context';
import { room } from '@/_shared/utils/sdk';

export type ParticipantStream = InstanceStream;

const defaultValue = {
  streams: [] as ParticipantStream[],
};

const ParticipantContext = createContext(defaultValue);

export const useParticipantContext = () => {
  return useContext(ParticipantContext);
};

export function ParticipantProvider({
  children,
  localMediaStream,
}: {
  children: React.ReactNode;
  localMediaStream: MediaStream;
}) {
  const { peer } = usePeerContext();
  const [streams, setStreams] = useState<ParticipantStream[]>([]);

  useEffect(() => {
    if (peer) {
      room.on(room.event.STREAM_ADDED, () => {
        setStreams(peer.getAllStreams());
      });

      room.on(room.event.STREAM_REMOVED, () => {
        setStreams(peer.getAllStreams());
      });

      peer.addStream(localMediaStream.id, {
        origin: 'local',
        source: 'media',
        mediaStream: localMediaStream,
      });
    }
  }, [peer, localMediaStream]);

  return (
    <ParticipantContext.Provider value={{ streams }}>
      {children}
    </ParticipantContext.Provider>
  );
}
