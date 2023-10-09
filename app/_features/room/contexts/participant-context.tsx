import { createContext, useContext, useEffect, useState } from 'react';
import type { InstanceStream } from '@/_shared/sdk/room/stream/stream-types';
import { usePeerContext } from '@/_features/room/contexts/peer-context';
import { useClientContext } from '@/_features/room/contexts/client-context';
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
}: {
  children: React.ReactNode;
}) {
  const { clientID, clientName } = useClientContext();
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
        clientId: clientID,
        name: clientName,
        origin: 'local',
        source: 'media',
        mediaStream: localStream,
      });
    }
  }, [peer, localStream, clientID, clientName]);

  return (
    <ParticipantContext.Provider value={{ streams }}>
      {children}
    </ParticipantContext.Provider>
  );
}
