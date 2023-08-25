'use client';
import { useEffect, useState } from 'react';
import { room } from '@/_shared/utils/sdk';

type Props = {
  roomId: string;
  children({ clientId }: { clientId: string }): React.ReactNode;
};

export default function ClientContainer({ roomId, children }: Props) {
  const [clientIdState, setClientIdState] = useState('');

  useEffect(() => {
    if (!clientIdState) {
      room.createClient(roomId).then((response) => {
        setClientIdState(response.data.clientId);
      });
    }
  }, [roomId, clientIdState]);

  return <>{children({ clientId: clientIdState })}</>;
}
