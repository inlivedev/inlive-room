'use client';

import { useEffect } from 'react';
import Lobby from '@/_features/room/components/lobby';
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
import { useToggle } from '@/_shared/hooks/use-toggle';
import type { ClientType } from '@/_shared/types/client';

type ViewProps = {
  roomID: string;
  client: ClientType.ClientData;
  isModerator: boolean;
};

export default function View({ roomID, client, isModerator }: ViewProps) {
  const { active: isConferenceActive, setActive: setActiveConference } =
    useToggle(false);

  useEffect(() => {
    document.addEventListener('open:conference-component', setActiveConference);

    return () => {
      document.removeEventListener(
        'open:conference-component',
        setActiveConference
      );
    };
  }, [setActiveConference]);

  return (
    <div className="bg-zinc-900 text-zinc-200">
      <PeerProvider roomID={roomID} client={client}>
        <ClientProvider roomID={roomID} client={client}>
          <DeviceProvider>
            <ParticipantProvider>
              <DataChannelProvider>
                <ChatProvider>
                  <EventContainer />
                  <ChatDrawerMenu />
                  <MetadataProvider>
                    {isConferenceActive ? (
                      <Conference isModerator={isModerator} />
                    ) : (
                      <Lobby roomID={roomID} />
                    )}
                  </MetadataProvider>
                </ChatProvider>
              </DataChannelProvider>
            </ParticipantProvider>
          </DeviceProvider>
        </ClientProvider>
      </PeerProvider>
    </div>
  );
}
