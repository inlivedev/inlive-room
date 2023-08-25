'use client';
import { useEffect, useState } from 'react';
import { registerClientToCookie } from '@/_features/room/server-actions/cookie-action';

type Props = {
  roomId: string;
  children({ clientId }: { clientId: string }): React.ReactNode;
};

export default function ClientContainer({ roomId, children }: Props) {
  const [clientIdState, setClientIdState] = useState('');

  useEffect(() => {
    if (!clientIdState) {
      registerClientToCookie(roomId).then(({ clientId }) => {
        setClientIdState(clientId);
      });
    }
  }, [roomId, clientIdState]);

  return <>{children({ clientId: clientIdState })}</>;
}
