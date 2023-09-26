import { Mixpanel } from '@/_shared/components/analytics/mixpanel';
import { useNavigate } from '@/_shared/hooks/use-navigate';
import { CreateJoinRoomResponse } from '@/_shared/response/internal/room';
import { InternalApiFetcher } from '@/_shared/utils/fetcher';
import { isError } from 'lodash-es';

export const useCreateRoom = () => {
  const { navigateTo } = useNavigate();

  const createRoomHandler = async (name?: string) => {
    try {
      const response: CreateJoinRoomResponse = await InternalApiFetcher.post(
        '/api/room/create',
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

      Mixpanel.track('Create room', {
        roomId: roomData.id,
        externalRoomId: roomData.roomId,
        createdBy: roomData.createdBy,
      });

      navigateTo(`/room/${roomData.id}`);
    } catch (error) {
      alert('Failed to create a room. Please try again later! ');
      if (!isError(error)) {
        console.log(`Failed when decoding request response`);
      }
      console.log(`Failed when decoding request response : ${error}`);
    }
  };

  return { createRoom: createRoomHandler };
};
