import Layout from '@/_features/room/components/layout';
import { PeerProvider } from '@/_features/room/contexts/peer-context';

export default function Container({
  roomId,
  clientId,
  origin,
}: {
  roomId: string;
  clientId: string;
  origin: string;
}) {
  return (
    <PeerProvider roomId={roomId} clientId={clientId}>
      <Layout roomId={roomId} clientId={clientId} origin={origin} />
    </PeerProvider>
  );
}
