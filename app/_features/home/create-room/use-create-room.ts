import { useNavigate } from '@/_shared/hooks/use-navigate';
import { Mixpanel } from '@/_shared/components/analytics/mixpanel';
import { room } from '@/_shared/utils/sdk';

export const useCreateRoom = () => {
  const { navigateTo } = useNavigate();

  const createRoomHandler = async () => {
    room
      .createRoom()
      .then(async (response) => {
        if (!response || !response.ok) {
          throw response;
        }

        Mixpanel.track('Create room', {
          roomId: response.data.roomId,
        });

        navigateTo(`/room/${response.data.roomId}`);
      })
      .catch((error) => {
        alert('Failed to create a room. Please try again later! ');
        console.error(error);
      });
  };

  return { createRoom: createRoomHandler };
};
