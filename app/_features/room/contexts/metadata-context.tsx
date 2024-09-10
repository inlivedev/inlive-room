'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { clientSDK, RoomEvent } from '@/_shared/utils/sdk';

const defaultData = {
  isModerator: false as boolean,
  moderatorClientIDs: [] as string[],
  roomType: 'meeting' as string,
  previousLayout: 'gallery' as
    | 'gallery'
    | 'speaker'
    | 'multispeakers'
    | 'presentation',
  currentLayout: 'gallery' as
    | 'gallery'
    | 'speaker'
    | 'multispeakers'
    | 'presentation',
  speakerClientIDs: [] as string[],
  pinnedStreams: [] as string[],
  mutedStreams: [] as string[],
  offCameraStreams: [] as string[],
};

const MetadataContext = createContext(defaultData);

export const useMetadataContext = () => {
  return useContext(MetadataContext);
};

export function MetadataProvider({
  children,
  roomType,
  isModerator,
}: {
  children: React.ReactNode;
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

  useEffect(() => {
    const handleMetadataChange = (event: any) => {
      setMetadataState((prevData) => {
        const metadata = {
          ...prevData,
          [event.key]: event.data[event.key],
        };

        return metadata;
      });
    };

    clientSDK.addEventListener(RoomEvent.META_CHANGED, handleMetadataChange);

    return () => {
      clientSDK.removeEventListener(
        RoomEvent.META_CHANGED,
        handleMetadataChange
      );
    };
  }, []);

  return (
    <MetadataContext.Provider value={metadataState}>
      {children}
    </MetadataContext.Provider>
  );
}
