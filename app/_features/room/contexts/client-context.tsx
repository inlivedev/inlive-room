'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import type { ClientType } from '@/_shared/types/client';
import { clientSDK } from '@/_shared/utils/sdk';
import { usePeerContext } from '@/_features/room/contexts/peer-context';
import { InternalApiFetcher } from '@/_shared/utils/fetcher';
import { UserType } from '@/_shared/types/user';

type ClientProviderProps = {
  roomID: string;
  clientID: string;
  clientName: string;
  roomType: string;
};

const ClientContext = createContext<ClientProviderProps>({
  roomID: '',
  clientID: '',
  clientName: '',
  roomType: ' ',
});

export const useClientContext = () => {
  return useContext(ClientContext);
};

export function ClientProvider({
  roomID,
  client,
  children,
  roomType,
}: {
  roomID: string;
  roomType: string;
  client: ClientType.ClientData;
  children: React.ReactNode;
}) {
  const [clientState, setClientState] = useState<ClientType.ClientData>(client);
  const { peer } = usePeerContext();
  const [clientJoinTime, setClientJoinTime] = useState<string | undefined>(
    undefined
  );
  const [isActivityRecorded, setIsActivityRecorded] = useState(false);

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
    const recordClientJoin = ((event: CustomEvent) => {
      const detail = event.detail || {};
      const joinTime = new Date(detail.joinTime).toISOString();

      console.log(joinTime, 'joinTime');
      console.log('detail', detail);

      setClientJoinTime(joinTime);
    }) as EventListener;

    document.addEventListener('trigger:client-join', recordClientJoin);

    return () => {
      document.removeEventListener('trigger:client-join', recordClientJoin);
    };
  }, []);

  useEffect(() => {
    const onBrowserClose = () => {
      const clientLeaveTime = new Date().toISOString();

      if (isActivityRecorded) return;

      InternalApiFetcher.post(`/api/user/activity`, {
        body: JSON.stringify({
          name: 'RoomDuration',
          meta: {
            roomID: roomID,
            clientID: client.clientID,
            name: client.clientName,
            joinTime: clientJoinTime,
            leaveTime: clientLeaveTime,
            roomType: roomType,
          },
        }),
      });
    };

    window.addEventListener('beforeunload', onBrowserClose);
  });

  useEffect(() => {
    const clientLeave = async (clientID: string, roomType: string) => {
      if (peer?.getPeerConnection()) peer.disconnect();

      try {
        const response = await clientSDK.leaveRoom(roomID, clientID, false);
        if (!response || !response.ok) {
          throw new Error(
            response?.message || 'Failed to get response from the server'
          );
        }

        const clientLeaveTime = new Date().toISOString();

        const resp: UserType.SendActivityResp = await InternalApiFetcher.post(
          `/api/user/activity`,
          {
            body: JSON.stringify({
              name: 'RoomDuration',
              meta: {
                roomID: roomID,
                clientID: client.clientID,
                name: client.clientName,
                joinTime: clientJoinTime,
                leaveTime: clientLeaveTime,
                roomType: roomType,
              },
            }),
          }
        );

        if (resp.ok) {
          setIsActivityRecorded(true);
        }

        document.dispatchEvent(
          new CustomEvent('set:conference-view', {
            detail: {
              view: 'exit',
            },
          })
        );
      } catch (error) {
        Sentry.captureException(error, {
          extra: {
            message: `API call error when trying to leave the room`,
          },
        });
        console.error(error);
      }
    };

    const handleClientLeave = ((event: CustomEvent) => {
      const detail = event.detail || {};
      const clientID = detail.clientID;
      const roomType = detail.roomType;
      clientLeave(clientID, roomType);
    }) as EventListener;

    document.addEventListener('trigger:client-leave', handleClientLeave);

    return () => {
      document.removeEventListener('trigger:client-leave', handleClientLeave);
    };
  }, [
    client.clientID,
    client.clientName,
    clientJoinTime,
    clientState.clientID,
    peer,
    roomID,
  ]);

  return (
    <ClientContext.Provider
      value={{
        roomID: roomID,
        clientID: clientState.clientID,
        clientName: clientState.clientName,
        roomType: roomType,
      }}
    >
      {children}
    </ClientContext.Provider>
  );
}
