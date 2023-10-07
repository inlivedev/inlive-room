import { createContext, useContext, useEffect, useState } from 'react';
import type { InstanceStream } from '@/_shared/sdk/room/stream/stream-types';
import { usePeerContext } from '@/_features/room/contexts/peer-context';
import { room } from '@/_shared/utils/sdk';
import type { ClientType } from '@/_shared/types/client';

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
  client,
}: {
  children: React.ReactNode;
  client: ClientType.ClientData;
}) {
  const { peer } = usePeerContext();
  const [streams, setStreams] = useState<ParticipantStream[]>([]);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    const onMediaInputTurnedOn = ((event: CustomEvent) => {
      const detail = event.detail || {};
      const mediaInput = detail.mediaInput;

      if (mediaInput instanceof MediaStream) {
        setLocalStream(mediaInput);
      }
    }) as EventListener;

    document.addEventListener('turnon:media-input', onMediaInputTurnedOn);

    return () => {
      document.removeEventListener('turnon:media-input', onMediaInputTurnedOn);
    };
  }, []);

  useEffect(() => {
    if (peer && localStream) {
      room.on(room.event.STREAM_ADDED, () => {
        setStreams(peer.getAllStreams());
      });

      room.on(room.event.STREAM_REMOVED, () => {
        setStreams(peer.getAllStreams());
      });

      peer.addStream(localStream.id, {
        clientId: client.id,
        name: client.name,
        origin: 'local',
        source: 'media',
        mediaStream: localStream,
      });
    }
  }, [peer, localStream, client]);

  return (
    <ParticipantContext.Provider value={{ streams }}>
      {children}
    </ParticipantContext.Provider>
  );
}
