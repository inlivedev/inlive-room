import { Button } from '@nextui-org/react';
import HangUpIcon from '@/_shared/components/icons/hang-up-icon';
import { useLeaveRoom } from '@/_features/room/hooks/use-leave-room';

export default function ButtonLeave() {
  const { leaveRoom } = useLeaveRoom();

  return (
    <Button
      isIconOnly
      variant="flat"
      aria-label="Leave from this room"
      className="bg-red-600/70 hover:bg-red-600 focus:outline-zinc-100 active:bg-red-500"
      onClick={leaveRoom}
    >
      <HangUpIcon width={20} height={20} />
    </Button>
  );
}
