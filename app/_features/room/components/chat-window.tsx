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
import { UseChannelContext, messageData } from '../contexts/channel-context';
import { useEffect } from 'react';

export default function ChatWindow({
  isChatWindowOpen,
  onOpenChange,
}: {
  isChatWindowOpen: boolean | undefined;
  onOpenChange: () => void;
}) {
  const { dataChannel, isChannelOpen } = UseChannelContext();

  useEffect(() => {
    if (!dataChannel) return;

    if (isChannelOpen) {
      console.log('Open gannn');
    }

    dataChannel.addEventListener('message', (event) => {
      if (dataChannel.label == 'chat') {
        const decoder = new TextDecoder();
        const bufferData = event.data as ArrayBuffer;
        const data = decoder.decode(bufferData);
        const message: messageData = JSON.parse(data);
        console.log(message);
      }
    });
  }, [dataChannel, isChannelOpen]);

  return (
    <Modal
      className={`${styles['modalContainerRight']} min-h-screen bg-neutral-900 opacity-80 backdrop-blur-md`}
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
        <ModalFooter>
          <div className="flex">
            <div className="flex-auto">
              <Input></Input>
            </div>
            <div className="flex-none">
              <Button
                className="bg-green-500 hover:bg-blue-600 focus:outline-zinc-100 active:bg-blue-500 disabled:bg-red-600/70"
                isIconOnly={true}
                isDisabled={!isChannelOpen}
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
