'use client';

import { createContext, useContext, useState } from 'react';
import type { ClientType } from '@/_shared/types/client';

const defaultValue: ClientType.ClientData = {
  clientID: '',
  clientName: '',
};

const ClientContext = createContext({
  ...defaultValue,
});

export const useClientContext = () => {
  return useContext(ClientContext);
};

export function ClientProvider({
  client,
  children,
}: {
  client: ClientType.ClientData;
  children: React.ReactNode;
}) {
  const [clientState] = useState<ClientType.ClientData>(client);

  return (
    <ClientContext.Provider
      value={{
        clientID: clientState.clientID,
        clientName: clientState.clientName,
      }}
    >
      {children}
    </ClientContext.Provider>
  );
}
