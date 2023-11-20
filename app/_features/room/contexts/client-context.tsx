'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import type { ClientType } from '@/_types/client';

const ClientContext = createContext({
  roomID: '',
  clientID: '',
  clientName: '',
});

export const useClientContext = () => {
  return useContext(ClientContext);
};

export function ClientProvider({
  roomID,
  client,
  children,
}: {
  roomID: string;
  client: ClientType.ClientData;
  children: React.ReactNode;
}) {
  const [clientState, setClientState] = useState<ClientType.ClientData>(client);

  useEffect(() => {
    const setClientName = ((event: CustomEvent) => {
      const detail = event.detail || {};
      const clientName = detail.clientName;

      setClientState((prevData) => ({
        ...prevData,
        clientName: clientName,
      }));
    }) as EventListener;

    document.addEventListener('set:client-name', setClientName);

    return () => {
      document.removeEventListener('set:client-name', setClientName);
    };
  }, []);

  return (
    <ClientContext.Provider
      value={{
        roomID: roomID,
        clientID: clientState.clientID,
        clientName: clientState.clientName,
      }}
    >
      {children}
    </ClientContext.Provider>
  );
}
