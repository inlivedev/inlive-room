import { Room } from '@/(server)/api/room/interface';
import { useNavigate } from '@/_shared/hooks/use-navigate';
import { InternalAPIFetcher } from '@/_shared/utils/api';

export const useCreateRoom = () => {
  const { navigateTo } = useNavigate();

  const createRoomHandler = async (name?: string) => {
    const response = await InternalAPIFetcher.post('api/room/create', {
      body: JSON.stringify({
        name: name,
      }),
    });

    if (typeof response !== 'string') {
      const roomData = response.body?.data as Room;

      if (typeof roomData.id != 'string') {
        alert('Failed to create a room. Please try again later! ');
        console.log('Failed when decoding request response');
      }

      navigateTo(`/room/${roomData.id}`);
    } else {
      alert('Failed to create a room. Please try again later! ');
      console.log(
        `Failed when decoding request response, got response ${response}`
      );
    }
  };

  return { createRoom: createRoomHandler };
};
