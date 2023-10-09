import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@nextui-org/react';
import styles from '@/_features/room/styles/conference.module.css';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { usePeerContext } from '../contexts/peer-context';
import { ChatType } from '@/_shared/types/chat';

export default function ChatWindow({
  isChatWindowOpen,
  onOpenChange,
}: {
  isChatWindowOpen: boolean | undefined;
  onOpenChange: () => void;
}) {
  const { peer } = usePeerContext();
  const [isChatActive, setChatActive] = useState(false);
  const [chatInputValue, setInputValue] = useState('');
  const [dataChannel, setDataChannel] = useState<RTCDataChannel | undefined>();

  useEffect(() => {
    const peerConnection = peer?.getPeerConnection();

    if (!peerConnection) return;

    setChatActive(true);

    peerConnection.addEventListener('datachannel', (chEvent) => {
      const receiveChannel = chEvent.channel;
      receiveChannel.binaryType = 'arraybuffer';

      if (receiveChannel.label == 'chat') setDataChannel(receiveChannel);

      receiveChannel.addEventListener('message', (event) => {
        if (receiveChannel.label == 'chat') {
          const decoder = new TextDecoder();
          const bufferData = event.data as ArrayBuffer;
          const data = decoder.decode(bufferData);
          const message: ChatType.ChatMessage = JSON.parse(data);
          console.log(message);
        }
      });
    });
  }, [peer]);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const sendChatMessage = useCallback(() => {
    console.log(chatInputValue);
    if (!chatInputValue || chatInputValue != '')
      dataChannel?.send(
        JSON.stringify({ sender: 'test', message: chatInputValue })
      );
  }, [dataChannel, chatInputValue]);

  return (
    <Modal
      className={`fixed inset-y-0 right-0 h-screen min-h-screen w-1/5 bg-neutral-900 opacity-80 backdrop-blur-md`}
      isOpen={isChatWindowOpen}
      onOpenChange={onOpenChange}
      size={'full'}
      backdrop="transparent"
      scrollBehavior="inside"
      motionProps={{
        variants: {
          enter: {
            x: 0,
            opacity: 1,
            transition: {
              duration: 0.3,
              ease: 'easeOut',
            },
          },
          exit: {
            x: +20,
            opacity: 0,
            transition: {
              duration: 0.2,
              ease: 'easeIn',
            },
          },
        },
      }}
    >
      <ModalContent>
        <ModalHeader>
          <div className="text-xl font-semibold">Chat</div>
        </ModalHeader>
        <ModalBody>
          <ChatWindowBody></ChatWindowBody>
        </ModalBody>
        <ModalFooter className="flex-col">
          <div className="flex min-w-max space-x-1">
            <div className="flex-auto">
              <Input
                value={chatInputValue}
                onChange={handleInputChange}
              ></Input>
            </div>
            <div className="flex-1">
              <Button
                className="bg-green-500 hover:bg-blue-600 focus:outline-zinc-100 active:bg-blue-500 disabled:bg-red-600/70"
                isIconOnly={true}
                isDisabled={!isChatActive}
                onClick={sendChatMessage}
              ></Button>
            </div>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

function ChatWindowBody() {
  return (
    <div>
      <Chat></Chat>
      <Chat></Chat>
      <Chat></Chat>
      <Chat></Chat>
      <Chat></Chat>
    </div>
  );
}

function Chat() {
  return (
    <div className="inline-flex  flex-col items-start justify-start">
      <div className="inline-flex items-center justify-start">
        <div className="flex space-x-4">
          <div className="flex-auto self-center font-semibold leading-tight text-rose-300">
            Gagah Ghaniswara
          </div>
          <div className="flex-none  self-center font-normal text-zinc-400">
            12:36 PM
          </div>
        </div>
      </div>
      <div className="self-stretch font-normal  text-zinc-100">
        Thanks! I will check on that
      </div>
    </div>
  );
}
