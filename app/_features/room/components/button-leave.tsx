import { Button } from '@nextui-org/react';
import HangUpIcon from '@/_shared/components/icons/hang-up-icon';
import { useClientContext } from '@/_features/room/contexts/client-context';

export default function ButtonLeave() {
  const { clientID } = useClientContext();

  const handleLeaveRoom = () => {
    document.dispatchEvent(
      new CustomEvent('trigger:client-leave', {
        detail: {
          clientID: clientID,
        },
      })
    );
  };

  return (
    <Button
      isIconOnly
      variant="flat"
      aria-label="Leave from this room"
      className="bg-red-600/70 hover:bg-red-600 focus:outline-zinc-100 active:bg-red-500"
      onClick={handleLeaveRoom}
    >
      <HangUpIcon width={20} height={20} />
    </Button>
  );
}
