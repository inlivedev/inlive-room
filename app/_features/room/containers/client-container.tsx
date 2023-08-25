'use client';
import { useEffect, useState } from 'react';
import { setClientCookie } from '@/_features/room/server-actions/cookie-action';

type ClientType = {
  roomId: string;
  clientId: string;
};

type Props = {
  roomId: string;
  children({ client }: { client: ClientType }): React.ReactNode;
};

export default function ClientContainer({ roomId, children }: Props) {
  const [clientState, setClientState] = useState({
    clientId: '',
    roomId: '',
  });

  useEffect(() => {
    setClientCookie(roomId).then((client) => {
      setClientState(client);
    });
  }, [roomId]);

  return <>{children({ client: clientState })}</>;
}
