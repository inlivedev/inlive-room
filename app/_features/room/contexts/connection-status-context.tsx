// TODO : Add ability to Observe the ICE Connection & Connection Signal / Bandwidth

import { ChannelEvents } from '@/_shared/sdk/room/channel/channel';
import { room } from '@/_shared/utils/sdk';
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
    room.on(ChannelEvents.CHANNEL_CONNECTED, () => {
      console.log('success subscribe to event endpoint');
      setConnectionState(true);
    });

    room.on(ChannelEvents.CHANNEL_NOT_FOUND, () => {
      setConnectionState(false);
      console.log('event endpoint removed');
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
