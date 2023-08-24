import { useNavigate } from '@/_shared/hooks/use-navigate';
import { Mixpanel } from '@/_shared/components/analytics/mixpanel';
import { Fetcher } from '@/_shared/utils/fetcher';
import type { ResponseBodyPOST } from '@/api/rooms/create/route';

export const useCreateRoom = () => {
  const { navigateTo } = useNavigate();

  const createRoomHandler = async () => {
    const fetcher = Fetcher(window.location.origin);
    fetcher
      .post('/api/rooms/create')
      .then((response: ResponseBodyPOST) => {
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
