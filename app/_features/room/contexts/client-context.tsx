'use client';

import { createContext, useContext, useState } from 'react';
import type { ClientType } from '@/_shared/types/client';

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
  const [clientState] = useState<ClientType.ClientData>(client);

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
