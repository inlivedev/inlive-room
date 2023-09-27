import { useEffect } from 'react';
import { room } from '@/_shared/utils/sdk';
import { usePeerContext } from '@/_features/room/contexts/peer-context';
import { useNavigate } from '@/_shared/hooks/use-navigate';

export const useLeaveRoom = () => {
  const { roomId, clientId, peer } = usePeerContext();
  const { navigateTo, prefetch } = useNavigate();

  useEffect(() => {
    prefetch('/');
  }, [prefetch]);

  const leaveRoom = async () => {
    if (!peer) return;

    peer.disconnect();
    room.leaveRoom(roomId, clientId).then((response) => {
      if (response.code >= 300) {
        throw new Error('Failed to end the call');
      }
    });

    navigateTo('/');
  };

  return { leaveRoom };
};
