import { useMemo } from 'react';
import { room } from '@/_shared/utils/sdk';

export const useCreatePeer = (roomID: string, clientID: string) => {
  const peer = useMemo(() => {
    if (typeof window === 'undefined' || !roomID || !clientID) return null;

    return room.createPeer(roomID, clientID);
  }, [roomID, clientID]);

  return peer;
};
