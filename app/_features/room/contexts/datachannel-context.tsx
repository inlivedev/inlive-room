'use client';

import { createContext, useContext, useEffect } from 'react';
import { usePeerContext } from '@/_features/room/contexts/peer-context';

const defaultValue = {
  datachannels: new Map<string, RTCDataChannel>(),
};

const DataChannelContext = createContext(defaultValue);

export const useDataChannelContext = () => {
  return useContext(DataChannelContext);
};

export const DataChannelProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { peer } = usePeerContext();
  const { datachannels } = useDataChannelContext();

  useEffect(() => {
    const peerConnection = peer?.getPeerConnection() || null;

    if (!peerConnection) return;

    const onPeerDataChannelAdded = (event: RTCDataChannelEvent) => {
      const datachannel = event.channel;
      datachannel.binaryType = 'arraybuffer';
      datachannels.set(datachannel.label, datachannel);

      datachannel.addEventListener('message', (event) => {
        const textDecoder = new TextDecoder();
        const bufferData = event.data;
        const data = textDecoder.decode(bufferData);
        const message = JSON.parse(data);

        document.dispatchEvent(
          new CustomEvent('trigger:datachannel-message', {
            detail: {
              datachannel: datachannel,
              message: message,
            },
          })
        );
      });
    };

    peerConnection.addEventListener('datachannel', (e) => {
      if (e.channel.label !== 'internal') {
        onPeerDataChannelAdded(e);
      }
    });

    return () => {
      peerConnection.removeEventListener('datachannel', onPeerDataChannelAdded);
    };
  }, [peer, datachannels]);

  return (
    <DataChannelContext.Provider
      value={{
        datachannels: datachannels,
      }}
    >
      {children}
    </DataChannelContext.Provider>
  );
};
