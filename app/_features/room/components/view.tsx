'use client';

import { useState, useEffect } from 'react';
import ConferenceLobby from '@/_features/room/components/conference-lobby';
import ConferenceExit from '@/_features/room/components/conference-exit';
import { ClientProvider } from '@/_features/room/contexts/client-context';
import { PeerProvider } from '@/_features/room/contexts/peer-context';
import { DataChannelProvider } from '../contexts/datachannel-context';
import { ChatProvider } from '@/_features/room/contexts/chat-context';
import { MetadataProvider } from '@/_features/room/contexts/metadata-context';
import EventContainer from '@/_features/room/components/event-container';
import Conference from '@/_features/room/components/conference';
import type { ClientType } from '@/_shared/types/client';

type ViewProps = {
  roomID: string;
  client: ClientType.ClientData;
  roomType: string;
  isModerator: boolean;
  debug: boolean;
};

export default function View({
  roomID,
  client,
  roomType,
  isModerator,
  debug,
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
      <PeerProvider roomID={roomID} client={client} debug={debug}>
        <MetadataProvider
          roomID={roomID}
          roomType={roomType}
          isModerator={isModerator}
        >
          <ClientProvider roomID={roomID} client={client} roomType={roomType}>
            <DataChannelProvider>
              <ChatProvider>
                <EventContainer>
                  {activeView === 'exit' ? (
                    <ConferenceExit />
                  ) : (
                    <div>
                      <div
                        className={activeView === 'conference' ? '' : 'hidden'}
                      >
                        <Conference />
                      </div>
                      <div
                        className={activeView === 'conference' ? 'hidden' : ''}
                      >
                        <ConferenceLobby roomID={roomID} />
                      </div>
                    </div>
                  )}
                </EventContainer>
              </ChatProvider>
            </DataChannelProvider>
          </ClientProvider>
        </MetadataProvider>
      </PeerProvider>
    </div>
  );
}
