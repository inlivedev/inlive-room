import { useNavigate } from '@/_shared/hooks/use-navigate';
import { CreateJoinRoomResponse } from '@/_shared/response/internal/room';
import { InternalApiFetcher } from '@/_shared/utils/fetcher';

export const useCreateRoom = () => {
  const { navigateTo } = useNavigate();

  const createRoomHandler = async (name?: string) => {
    try {
      const response: CreateJoinRoomResponse = await InternalApiFetcher.post(
        'api/room/create',
        {
          body: JSON.stringify({
            name: name,
          }),
        }
      );

      if (response.code > 299 || !response.data) {
        throw new Error(response.message);
      }

      const roomData = response.data;
      navigateTo(`/room/${roomData.id}`);
    } catch (error) {
      alert('Failed to create a room. Please try again later! ');
      console.log('Failed when decoding request response');
    }
  };

  return { createRoom: createRoomHandler };
};
