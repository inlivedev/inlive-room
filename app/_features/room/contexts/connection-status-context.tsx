// TODO : Add ability to Observe the ICE Connection & Connection Signal / Bandwidth

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
    room.on(room.event.CHANNEL_OPENED, () => {
      console.log('success subscribe to event endpoint');
      setConnectionState(true);
    });

    room.on(room.event.CHANNEL_CLOSED, ({ reason }) => {
      if (reason === 'notfound') {
        setConnectionState(false);
        console.log('event endpoint removed');
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
