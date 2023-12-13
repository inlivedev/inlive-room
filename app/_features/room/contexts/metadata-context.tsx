'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { clientSDK, RoomEvent } from '@/_shared/utils/sdk';
import { type ParticipantStream } from '@/_features/room/contexts/participant-context';
import { usePeerContext } from '@/_features/room/contexts/peer-context';

const defaultData = {
  isModerator: false as boolean,
  moderatorIDs: [] as string[],
  roomType: 'meeting' as string,
  layout: {
    current: 'gallery' as string,
    previous: '' as string,
  },
  speakers: [] as string[],
};

const MetadataContext = createContext(defaultData);

export const useMetadataContext = () => {
  return useContext(MetadataContext);
};

export function MetadataProvider({
  children,
  roomID,
  roomType,
}: {
  children: React.ReactNode;
  roomID: string;
  roomType: string;
}) {
  const [metadataState, setMetadataState] = useState({
    ...defaultData,
    roomType: roomType,
  });
  const { peer } = usePeerContext();
  const defaultLayout = roomType === 'event' ? 'speaker' : 'gallery';

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
          await clientSDK.setMetadata(roomID, {
            layout: {
              previous: metadataState.layout.current,
              current: 'presentation',
            },
          });
        }
      }
    );

    clientSDK.on(
      RoomEvent.STREAM_REMOVED,
      async ({ stream: removedStream }: { stream: ParticipantStream }) => {
        if (
          removedStream.source === 'screen' &&
          removedStream.origin === 'local'
        ) {
          const streams = peer.getAllStreams();

          const screen = streams.find((stream) => {
            return stream.source === 'screen';
          });

          if (!screen) {
            await clientSDK.setMetadata(roomID, {
              layout: {
                previous: metadataState.layout.current,
                current: metadataState.layout.previous.length
                  ? metadataState.layout.previous
                  : defaultLayout,
              },
            });
          }
        }
      }
    );
  }, [metadataState, peer, defaultLayout, roomID]);

  return (
    <MetadataContext.Provider value={metadataState}>
      {children}
    </MetadataContext.Provider>
  );
}
