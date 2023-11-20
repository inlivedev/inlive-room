'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import type { ChatType } from '@/_types/chat';
import { usePeerContext } from '@/_features/room/contexts/peer-context';

type AddMessageType = (message: ChatType.ChatMessage) => void;

const defaultValue = {
  messages: [] as ChatType.ChatMessage[],
  addMessage: null as AddMessageType | null,
  datachannel: null as RTCDataChannel | null,
};

const ChatContext = createContext(defaultValue);

export const useChatContext = () => {
  return useContext(ChatContext);
};

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { peer } = usePeerContext();
  const [messages, setMessages] = useState(defaultValue.messages);
  const [datachannelState, setDataChannelState] = useState(
    defaultValue.datachannel
  );

  const addMessage = (message: ChatType.ChatMessage) => {
    setMessages((prevData) => [...prevData, message]);
  };

  const onPeerDataChannelAdded = useCallback((event: RTCDataChannelEvent) => {
    const datachannel = event.channel;
    datachannel.binaryType = 'arraybuffer';

    if (datachannel.label === 'chat') {
      datachannel.addEventListener('message', (event) => {
        const textDecoder = new TextDecoder();
        const bufferData = event.data as ArrayBuffer;
        const data = textDecoder.decode(bufferData);
        const message: ChatType.ChatMessage = JSON.parse(data);
        setMessages((prevData) => [...prevData, message]);
      });

      setDataChannelState(datachannel);
    }
  }, []);

  useEffect(() => {
    const peerConnection = peer?.getPeerConnection() || null;

    if (!peerConnection) return;

    peerConnection.addEventListener('datachannel', onPeerDataChannelAdded);

    return () => {
      peerConnection.removeEventListener('datachannel', onPeerDataChannelAdded);
    };
  }, [peer, onPeerDataChannelAdded]);

  return (
    <ChatContext.Provider
      value={{
        messages: messages,
        addMessage: addMessage,
        datachannel: datachannelState,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}
