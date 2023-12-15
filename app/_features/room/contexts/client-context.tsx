'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import type { ClientType } from '@/_shared/types/client';
import { clientSDK } from '@/_shared/utils/sdk';
import { usePeerContext } from '@/_features/room/contexts/peer-context';

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
  const { peer } = usePeerContext();

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

  useEffect(() => {
    const handleDataChannelMessage = ((event: CustomEvent) => {
      const detail = event.detail || {};
      if (detail.datachannel.label === 'moderator') {
        const message = detail.message;

        if (message.type === 'remove-client') {
          const clientIDs = message.data.clientIDs as string[];

          const clientID = clientIDs.find(
            (clientID) => clientID === clientState.clientID
          );

          if (clientID) {
            document.dispatchEvent(
              new CustomEvent('trigger:client-leave', {
                detail: {
                  clientID: clientID,
                },
              })
            );
          }
        }
      }
    }) as EventListener;

    document.addEventListener(
      'trigger:datachannel-message',
      handleDataChannelMessage
    );

    return () => {
      document.removeEventListener(
        'trigger:datachannel-message',
        handleDataChannelMessage
      );
    };
  }, [clientState.clientID]);

  useEffect(() => {
    const clientLeave = async (clientID: string) => {
      if (!peer) return;

      try {
        peer.disconnect();
        const response = await clientSDK.leaveRoom(roomID, clientID, false);

        if (response.code >= 300) {
          console.error('Failed to end the call');
        }

        document.dispatchEvent(
          new CustomEvent('set:conference-view', {
            detail: {
              view: 'exit',
            },
          })
        );
      } catch (error) {
        console.error(error);
      }
    };

    const handleClientLeave = ((event: CustomEvent) => {
      const detail = event.detail || {};
      const clientID = detail.clientID;
      clientLeave(clientID);
    }) as EventListener;

    document.addEventListener('trigger:client-leave', handleClientLeave);

    return () => {
      document.removeEventListener('trigger:client-leave', handleClientLeave);
    };
  }, [clientState.clientID, peer, roomID]);

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
