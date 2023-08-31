import HangUpIcon from '@/_shared/components/icons/hang-up-icon';
import { useLeaveRoom } from '@/_features/room/hooks/use-leave-room';

export default function ButtonLeave() {
  const { leaveRoom } = useLeaveRoom();

  return (
    <button
      className="rounded-full bg-red-500 p-3"
      aria-label="Leave room"
      onClick={leaveRoom}
    >
      <HangUpIcon width={24} height={24} />
    </button>
  );
}
