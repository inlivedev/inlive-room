import HangUpIcon from '@/_shared/components/icons/hang-up-icon';
import { useLeaveRoom } from '@/_features/room/hooks/use-leave-room';

export default function ButtonLeave() {
  const { leaveRoom } = useLeaveRoom();

  return (
    <div className="flex items-center text-neutral-200">
      <button
        className={`flex h-full items-center gap-2 rounded bg-red-600 px-2.5 py-2 hover:bg-red-500 active:bg-red-400`}
        aria-label="Leave room"
        onClick={leaveRoom}
      >
        <HangUpIcon width={20} height={20} />
      </button>
    </div>
  );
}
