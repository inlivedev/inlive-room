import { useState, useCallback } from 'react';
import { room } from '@/_shared/utils/sdk';
import { usePeerContext } from '@/_features/room/contexts/peer-context';
import { useClientContext } from '@/_features/room/contexts/client-context';

export const useLeaveRoom = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { peer } = usePeerContext();
  const { clientID, roomID } = useClientContext();

  const leaveRoom = useCallback(async () => {
    if (!peer) return;

    if (!isSubmitting) {
      setIsSubmitting(true);

      try {
        peer.disconnect();
        const response = await room.leaveRoom(roomID, clientID, false);

        if (response.code >= 300) {
          console.error('Failed to end the call');
        }

        setIsSubmitting(false);
        window.location.href = '/';
      } catch (error) {
        setIsSubmitting(false);
        console.error(error);
      }
    }
  }, [roomID, clientID, peer, isSubmitting]);

  return { leaveRoom, isSubmitting };
};
