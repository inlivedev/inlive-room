'use client';

import { useEffect, useCallback } from 'react';
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure,
  ModalFooter,
} from '@nextui-org/react';
import { usePeerContext } from '@/_features/room/contexts/peer-context';
import type { ChatType } from '@/_shared/types/chat';
import SendPlaneIcon from '@/_shared/components/icons/send-plane-icon';

export default function ChatMenu() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { peer } = usePeerContext();

  const openMenu = useCallback(() => {
    console.log('open menu');
    onOpen();
  }, [onOpen]);

  useEffect(() => {
    document.addEventListener('open:room-chat-menu', openMenu);

    return () => {
      document.removeEventListener('open:room-chat-menu', openMenu);
    };
  }, [openMenu]);

  useEffect(() => {
    const peerConnection = peer?.getPeerConnection();

    if (!peerConnection) return;

    document.addEventListener('add:data-channel', () => {
      //
    });

    peerConnection.addEventListener('datachannel', (event) => {
      const receiveChannel = event.channel;
      receiveChannel.binaryType = 'arraybuffer';

      if (receiveChannel.label === 'chat') {
        document.dispatchEvent(
          new CustomEvent('add:data-channel', {
            detail: {
              datachannel: receiveChannel,
            },
          })
        );
      }

      receiveChannel.addEventListener('message', (event) => {
        if (receiveChannel.label === 'chat') {
          const textDecoder = new TextDecoder();
          const bufferData = event.data as ArrayBuffer;
          const data = textDecoder.decode(bufferData);
          const message: ChatType.ChatMessage = JSON.parse(data);
          console.log('receive channel message', message);
        }
      });
    });
  }, [peer]);

  return (
    <Modal
      isOpen={isOpen}
      size="full"
      onOpenChange={onOpenChange}
      backdrop="transparent"
      scrollBehavior="inside"
      className="fixed inset-y-0 right-0 h-full min-h-full w-full max-w-full bg-zinc-800/75 shadow-md backdrop-blur-md sm:w-96"
    >
      <ModalContent>
        <ModalHeader className="border-b border-zinc-700 p-4">
          <div className="text-lg font-semibold text-zinc-300">Chat</div>
        </ModalHeader>
        <ModalBody className="p-0">
          <ul className="flex flex-col gap-1">
            <ChatItem />
            <ChatItem />
            <ChatItem />
            <ChatItem />
            <ChatItem />
            <ChatItem />
            <ChatItem />
            <ChatItem />
            <ChatItem />
            <ChatItem />
          </ul>
        </ModalBody>
        <ModalFooter className="border-t border-zinc-700 px-4 pb-8 pt-6">
          <div className="relative w-full">
            <input
              type="text"
              className="w-full rounded-md bg-zinc-950 p-2.5 text-sm text-zinc-200 outline-none ring-1 ring-zinc-700 placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-400"
              placeholder="Type a message"
            />
            <Button
              isIconOnly
              variant="flat"
              aria-label="Send chat"
              // onClick={sendChatMessage}
              className="absolute right-3 top-1/2 h-6 w-6 min-w-0 -translate-y-1/2 rounded-full bg-transparent text-zinc-400"
            >
              <SendPlaneIcon width={24} height={24} />
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

function ChatItem() {
  return (
    <li>
      <div className="px-4 py-2">
        <b className="block text-sm font-semibold text-rose-300">Faiq Naufal</b>
        <p className="mt-0.5 text-sm text-zinc-100">
          I wanna create video calls, add events to calendar, set reminders and
          invite participants via link
        </p>
      </div>
    </li>
  );
}
