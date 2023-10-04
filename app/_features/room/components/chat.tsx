import { useState } from 'react';
import { usePeerContext } from '../contexts/peer-context';
import { Button } from '@nextui-org/react';

interface messageData {
  sender: string;
  message: string;
}

export default function Chat() {
  const { peer } = usePeerContext();
  const [state, setState] = useState(false);
  const [chatChannel, setChatChannel] = useState<RTCDataChannel | undefined>();

  let peerConnection: RTCPeerConnection | undefined | null = undefined;

  while (!peerConnection) {
    peerConnection = peer?.getPeerConnection();
  }

  peerConnection.addEventListener('datachannel', (chEevent) => {
    const receiveChannel = chEevent.channel;
    receiveChannel.label;

    if (receiveChannel.label == 'chat') {
      setChatChannel(receiveChannel);
    }

    receiveChannel.addEventListener('message', (event) => {
      if (receiveChannel.label == 'chat') {
        console.log(event.data);

        const messageData: messageData = JSON.parse(event.data);
        console.log(messageData);
      }
    });

    receiveChannel.addEventListener('open', () => {
      if (receiveChannel.label == 'chat') {
        setState(true);
      }
    });

    receiveChannel.addEventListener('close', () => {
      if (receiveChannel.label == 'chat') {
        setState(false);
      }
    });
  });

  const sendMessage = (event: React.MouseEvent<HTMLButtonElement>) => {
    const num = 1;

    event.preventDefault();

    if (!chatChannel) {
      console.log('chat channel is not ready to send message');
      return;
    }

    chatChannel.send(
      JSON.stringify({
        sender: 'test',
        message: num.toString(),
      })
    );
  };

  return <Button isDisabled={state} onClick={sendMessage}></Button>;
}
