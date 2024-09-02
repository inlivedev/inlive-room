'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { clientSDK, RoomEvent } from '@/_shared/utils/sdk';
import { usePeerContext } from '@/_features/room/contexts/peer-context';
import type { ParticipantVideo } from '@/_features/room/components/conference';

type ParticipantStream = Omit<ParticipantVideo, 'videoElement'>;

const defaultData = {
  isModerator: false as boolean,
  moderatorClientIDs: [] as string[],
  roomType: 'meeting' as string,
  previousLayout: 'gallery' as
    | 'gallery'
    | 'speaker'
    | 'multi-speakers'
    | 'presentation',
  currentLayout: 'gallery' as
    | 'gallery'
    | 'speaker'
    | 'multi-speakers'
    | 'presentation',
  speakerClientIDs: [] as string[],
  pinnedStreams: [] as string[],
};

const MetadataContext = createContext(defaultData);

export const useMetadataContext = () => {
  return useContext(MetadataContext);
};

export function MetadataProvider({
  children,
  roomID,
  roomType,
  isModerator,
}: {
  children: React.ReactNode;
  roomID: string;
  roomType: string;
  isModerator: boolean;
}) {
  const defaultLayout = 'gallery';

  const [metadataState, setMetadataState] = useState<typeof defaultData>({
    ...defaultData,
    roomType: roomType,
    isModerator: isModerator,
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
          if (
            metadataState.previousLayout !== metadataState.currentLayout &&
            metadataState.currentLayout !== 'presentation'
          ) {
            try {
              await clientSDK.setMetadata(roomID, {
                previousLayout: metadataState.currentLayout,
              });
            } catch (error) {
              Sentry.captureException(error, {
                extra: {
                  message: `API call error when trying to set metadata previousLayout`,
                },
              });
              console.error(error);
            }
          }
        }

        if (availableStream.source === 'screen') {
          setMetadataState((prevData) => {
            if (prevData.currentLayout === 'presentation') {
              return prevData;
            }

            return {
              ...prevData,
              currentLayout: 'presentation',
            };
          });
        }
      }
    );

    clientSDK.on(
      RoomEvent.STREAM_REMOVED,
      async ({ stream: removedStream }: { stream: ParticipantStream }) => {
        if (removedStream.source === 'screen') {
          const streams = peer.getAllStreams();

          const screen = streams.find((stream) => {
            return stream.source === 'screen';
          });

          if (!screen) {
            setMetadataState((prevData) => {
              if (prevData.currentLayout === prevData.previousLayout) {
                return prevData;
              }

              return {
                ...prevData,
                currentLayout: prevData.previousLayout,
              };
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
