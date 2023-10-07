import Lobby from '@/_features/room/components/lobby';
import { PeerProvider } from '@/_features/room/contexts/peer-context';
import { DeviceProvider } from '@/_features/room/contexts/device-context';
import { ParticipantProvider } from '@/_features/room/contexts/participant-context';
import Conference from '@/_features/room/components/conference';
import type { ClientType } from '@/_shared/types/client';

type ViewProps = {
  roomID: string;
  client: ClientType.ClientData;
};

export default function View({ roomID, client }: ViewProps) {
  return (
    <div className="flex flex-1 flex-col bg-zinc-900 text-zinc-200">
      <PeerProvider roomID={roomID} client={client}>
        <DeviceProvider>
          <ParticipantProvider client={client}>
            <Conference />
          </ParticipantProvider>
        </DeviceProvider>
        <Lobby roomID={roomID} client={client} />
      </PeerProvider>
    </div>
  );
}
