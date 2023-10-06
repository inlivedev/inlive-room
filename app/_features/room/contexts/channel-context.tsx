import { useState, useEffect } from 'react';
import { usePeerContext } from './peer-context';

export interface messageData {
  sender: string;
  message: string;
}

export function UseChannelContext() {
  const { peer } = usePeerContext();
  const [dataChannel, setChannel] = useState<RTCDataChannel | undefined>();
  const [isChannelOpen, setChannelOpen] = useState(false);

  useEffect(() => {
    const peerConnection = peer?.getPeerConnection();

    if (!peerConnection) return;

    peerConnection.addEventListener('datachannel', (chEevent) => {
      const receiveChannel = chEevent.channel;
      receiveChannel.binaryType = 'arraybuffer';
      setChannel(receiveChannel);

      receiveChannel.addEventListener('open', () => {
        setChannelOpen(true);
      });

      receiveChannel.addEventListener('close', () => {
        setChannelOpen(false);
      });
    });
  }, [peer]);

  return { dataChannel, isChannelOpen };
}
