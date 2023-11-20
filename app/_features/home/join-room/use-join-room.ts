import { useInput } from '@/_hooks/use-input';

export const useJoinRoom = () => {
  const { value: roomId, bindValue: bindField } = useInput('');

  const joinRoomHandler = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();

    if (roomId.trim().length === 0) {
      throw new Error('Please enter the room code');
    }

    window.location.href = `/room/${roomId}`;
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
