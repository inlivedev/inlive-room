'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { clientSDK, RoomEvent } from '@/_shared/utils/sdk';
import { type ParticipantStream } from '@/_features/room/contexts/participant-context';
import { usePeerContext } from '@/_features/room/contexts/peer-context';

const defaultData = {
  host: {
    clientIDs: [] as string[],
  },
  layout: 'speaker' as 'speaker' | 'presentation',
  speakers: [] as string[],
};

const MetadataContext = createContext(defaultData);

export const useMetadataContext = () => {
  return useContext(MetadataContext);
};

export function MetadataProvider({
  children,
  roomID,
}: {
  roomID: string;
  children: React.ReactNode;
}) {
  const [metadataState, setMetadataState] = useState(defaultData);
  const { peer } = usePeerContext();

  useEffect(() => {
    clientSDK.on(RoomEvent.META_CHANGED, (event: any) => {
      setMetadataState((prevData) => {
        const metadata = {
          ...prevData,
          [event.key]: event.data[event.key],
        };

        return metadata;
      });
    });
  }, []);

  useEffect(() => {
    if (!peer) return;

    clientSDK.on(
      RoomEvent.STREAM_AVAILABLE,
      async ({ stream: availableStream }: { stream: ParticipantStream }) => {
        if (
          availableStream.source === 'screen' &&
          availableStream.origin === 'local'
        ) {
          const streams = peer.getAllStreams();
          const presenter = streams.find((stream) => {
            return (
              stream.clientId === availableStream.clientId &&
              stream.source === 'media' &&
              stream.origin === 'local'
            );
          });

          await clientSDK.setMetadata(roomID, {
            layout: 'presentation',
            speakers: [presenter],
          });
        }
      }
    );

    clientSDK.on(
      RoomEvent.STREAM_REMOVED,
      ({ stream: removedStream }: { stream: ParticipantStream }) => {
        if (
          removedStream.source === 'screen' &&
          removedStream.origin === 'local'
        ) {
          const streams = peer.getAllStreams();
          const presenter = streams.find((stream) => {
            return (
              stream.clientId === removedStream.clientId &&
              stream.source === 'media' &&
              stream.origin === 'local'
            );
          });

          const screen = streams.find((stream) => {
            return stream.source === 'screen';
          });

          if (!screen) {
            clientSDK.setMetadata(roomID, {
              layout: 'speaker',
              speakers: [presenter],
            });
          }
        }
      }
    );
  }, [roomID, peer]);

  return (
    <MetadataContext.Provider value={metadataState}>
      {children}
    </MetadataContext.Provider>
  );
}
