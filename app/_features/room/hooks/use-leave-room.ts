import { room } from '@/_shared/utils/sdk';
import { usePeerContext } from '@/_features/room/contexts/peer-context';
import { useClientContext } from '@/_features/room/contexts/client-context';

export const useLeaveRoom = () => {
  const { peer } = usePeerContext();
  const { clientID, roomID } = useClientContext();

  const leaveRoom = async () => {
    if (!peer) return;

    peer.disconnect();
    room
      .leaveRoom(roomID, clientID)
      .then((response) => {
        if (response.code >= 300) {
          console.error('Failed to end the call');
        }
      })
      .catch((error) => {
        console.error(error);
      });

    window.location.href = '/';
  };

  return { leaveRoom };
};
