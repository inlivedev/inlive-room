import { useMemo } from 'react';
import { room } from '@/_shared/utils/sdk';

export const useCreatePeer = (roomId: string, clientId: string) => {
  const peer = useMemo(() => {
    if (typeof window === 'undefined') return null;

    return room.createPeer(roomId, clientId);
  }, [roomId, clientId]);

  return peer;
};
