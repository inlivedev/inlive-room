// TODO : Add ability to Observe the ICE Connection & Connection Signal / Bandwidth

import {
  ChannelClosureReasons,
  RoomEvent,
  clientSDK,
} from '@/_shared/utils/sdk';
import { useContext, useEffect, useState, createContext } from 'react';

const ConnectionContext = createContext({
  sseConnection: false,
});

export const useConnectionContext = () => {
  return useContext(ConnectionContext);
};

export function ConnectionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [connectionState, setConnectionState] = useState(true);

  useEffect(() => {
    clientSDK.on(RoomEvent.CHANNEL_OPENED, () => {
      console.log('success subscribe to event endpoint');
      setConnectionState(true);
    });

    clientSDK.on(RoomEvent.CHANNEL_CLOSED, ({ reason }: { reason: string }) => {
      if (
        reason === ChannelClosureReasons.NOT_FOUND ||
        reason === ChannelClosureReasons.UNKNOWN
      ) {
        setConnectionState(false);
      }
    });
  }, []);

  useEffect(() => {
    console.log(connectionState);
  }, [connectionState]);

  return (
    <ConnectionContext.Provider value={{ sseConnection: connectionState }}>
      {children}
    </ConnectionContext.Provider>
  );
}
