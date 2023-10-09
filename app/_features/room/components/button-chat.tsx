import { useEffect, useState } from 'react';
import { Badge, Button, Spinner } from '@nextui-org/react';
import { usePeerContext } from '../contexts/peer-context';

export default function ButtonChat({ onOpen }: { onOpen: () => void }) {
  const { peer } = usePeerContext();
  const [numChat, setNumChat] = useState(0);
  const [isChannelOpen, setChannelOpen] = useState(false);

  useEffect(() => {
    const peerConnection = peer?.getPeerConnection();

    if (!peerConnection) return;

    peerConnection.addEventListener('datachannel', (chEevent) => {
      const receiveChannel = chEevent.channel;
      receiveChannel.binaryType = 'arraybuffer';

      receiveChannel.addEventListener('message', () => {
        if (receiveChannel.label == 'chat') {
          console.log(numChat);
          setNumChat((prevNumChat) => prevNumChat + 1);
          console.log(numChat);
        }
      });

      receiveChannel.addEventListener('open', () => {
        if (receiveChannel.label == 'chat') {
          setChannelOpen(true);
        }
      });

      receiveChannel.addEventListener('close', () => {
        if (receiveChannel.label == 'chat') {
          setChannelOpen(false);
        }
      });
    });
  }, [peer, numChat]);

  const resetBadge = () => {
    onOpen();
    setNumChat(0);
  };

  return (
    <Badge
      content={isChannelOpen ? numChat : <Spinner size="sm"></Spinner>}
      isInvisible={isChannelOpen && numChat == 0 ? true : false}
    >
      <Button
        isDisabled={false}
        isIconOnly
        variant="flat"
        onClick={resetBadge}
        className={`
        bg-zinc-700/70 
        hover:bg-zinc-600 
        active:bg-zinc-500
        `}
      ></Button>
    </Badge>
  );
}
