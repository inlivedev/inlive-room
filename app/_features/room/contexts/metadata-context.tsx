'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { clientSDK, RoomEvent } from '@/_shared/utils/sdk';
import { type ParticipantStream } from '@/_features/room/contexts/participant-context';
import { usePeerContext } from '@/_features/room/contexts/peer-context';

const defaultData = {
  isModerator: false as boolean,
  moderatorIDs: [] as string[],
  roomType: 'meeting' as string,
  previousLayout: 'gallery' as 'gallery' | 'speaker' | 'presentation',
  currentLayout: 'gallery' as 'gallery' | 'speaker' | 'presentation',
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
  const defaultLayout = roomType === 'event' ? 'speaker' : 'gallery';

  const [metadataState, setMetadataState] = useState<typeof defaultData>({
    ...defaultData,
    roomType: roomType,
    previousLayout: defaultLayout,
    currentLayout: defaultLayout,
  });

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
          if (metadataState.previousLayout !== metadataState.currentLayout) {
            await clientSDK.setMetadata(roomID, {
              previousLayout: metadataState.currentLayout,
            });
          }
        }

        if (availableStream.source === 'screen') {
          setMetadataState((prevData) => ({
            ...prevData,
            currentLayout: 'presentation',
          }));
        }
      }
    );

    clientSDK.on(
      RoomEvent.STREAM_REMOVED,
      async ({ stream: removedStream }: { stream: ParticipantStream }) => {
        const streams = peer.getAllStreams();

        const screen = streams.find((stream) => {
          return stream.source === 'screen';
        });

        if (removedStream.source === 'screen' && !screen) {
          setMetadataState((prevData) => ({
            ...prevData,
            currentLayout: prevData.previousLayout,
          }));
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
