'use client';

import { useState, useEffect } from 'react';
import ConferenceLobby from '@/_features/room/components/conference-lobby';
import ConferenceExit from '@/_features/room/components/conference-exit';
import { ClientProvider } from '@/_features/room/contexts/client-context';
import { PeerProvider } from '@/_features/room/contexts/peer-context';
import { DeviceProvider } from '@/_features/room/contexts/device-context';
import { ParticipantProvider } from '@/_features/room/contexts/participant-context';
import { DataChannelProvider } from '../contexts/datachannel-context';
import { ChatProvider } from '@/_features/room/contexts/chat-context';
import { MetadataProvider } from '@/_features/room/contexts/metadata-context';
import EventContainer from '@/_features/room/components/event-container';
import Conference from '@/_features/room/components/conference';
import ChatDrawerMenu from '@/_features/room/components/chat-drawer-menu';
import type { ClientType } from '@/_shared/types/client';
import { ConnectionProvider } from '../contexts/connection-status-context';

type ViewProps = {
  roomID: string;
  client: ClientType.ClientData;
  roomType: string;
  isModerator: boolean;
};

export default function View({
  roomID,
  client,
  roomType,
  isModerator,
}: ViewProps) {
  const [activeView, setActiveView] = useState<string>('lobby');

  useEffect(() => {
    const setView = ((event: CustomEvent) => {
      const detail = event.detail || {};
      const view = detail.view;

      if (typeof view === 'string') {
        setActiveView(view);
      }
    }) as EventListener;

    document.addEventListener('set:conference-view', setView);

    return () => {
      document.removeEventListener('set:conference-view', setView);
    };
  }, []);

  return (
    <div className="bg-zinc-900 text-zinc-200">
      <PeerProvider roomID={roomID} client={client}>
        <ClientProvider roomID={roomID} client={client}>
          <DeviceProvider>
            <ParticipantProvider>
              <DataChannelProvider>
                <ChatProvider>
                  <EventContainer>
                    <ChatDrawerMenu />
                    <MetadataProvider
                      roomID={roomID}
                      roomType={roomType}
                      isModerator={isModerator}
                    >
                      {activeView === 'exit' ? (
                        <ConferenceExit />
                      ) : activeView === 'conference' ? (
                        <Conference roomType={roomType} />
                      ) : (
                        <ConferenceLobby roomID={roomID} />
                      )}
                    </MetadataProvider>
                  </EventContainer>
                </ChatProvider>
              </DataChannelProvider>
            </ParticipantProvider>
          </DeviceProvider>
        </ClientProvider>
      </PeerProvider>
    </div>
  );
}
