import { useNavigate } from '@/_shared/hooks/use-navigate';
import { useInput } from '@/_shared/hooks/use-input';

export const useJoinRoom = () => {
  const { navigateTo } = useNavigate();

  const { value: roomId, bindValue: bindField } = useInput('');

  const joinRoomHandler = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();

    if (roomId.trim().length === 0) {
      throw new Error('Please enter the room code');
    }

    navigateTo(`/room/${roomId}`);
  };

  const getRoomId = () => {
    return roomId;
  };

  return {
    joinRoom: joinRoomHandler,
    getRoomId: getRoomId,
    bindField: bindField,
  };
};
