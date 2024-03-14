'use client';
import linkifyHtml from 'linkify-html';
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
import SendPlaneIcon from '@/_shared/components/icons/send-plane-icon';
import { useChatContext } from '@/_features/room/contexts/chat-context';
import { useClientContext } from '@/_features/room/contexts/client-context';
import { useInput } from '@/_shared/hooks/use-input';
import type { ChatType } from '@/_shared/types/chat';

export default function ChatDrawerMenu() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { clientID, clientName } = useClientContext();
  const { messages, addMessage, datachannel } = useChatContext();
  const {
    value: messageInput,
    bindValue: bindMessageInputField,
    setValue: setMessageInput,
  } = useInput('');

  const openMenu = useCallback(() => {
    onOpen();
  }, [onOpen]);

  const onMenuClosed = useCallback(() => {
    document.dispatchEvent(new CustomEvent('close:room-chat-menu'));
  }, []);

  const onSubmitMessage = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!datachannel) return;

      if (messageInput.trim().length !== 0) {
        const message: ChatType.ChatMessage = {
          sender: {
            client_id: clientID,
            name: clientName,
          },
          message: messageInput,
        };

        addMessage && addMessage(message);
        setMessageInput('');
        datachannel.send(JSON.stringify(message));
      }
    },
    [
      messageInput,
      datachannel,
      addMessage,
      setMessageInput,
      clientID,
      clientName,
    ]
  );

  useEffect(() => {
    document.addEventListener('open:room-chat-menu', openMenu);

    return () => {
      document.removeEventListener('open:room-chat-menu', openMenu);
    };
  }, [openMenu]);

  return (
    <Modal
      isOpen={isOpen}
      size="full"
      onOpenChange={onOpenChange}
      onClose={onMenuClosed}
      backdrop="transparent"
      scrollBehavior="inside"
      className="min-viewport-height fixed inset-y-0 right-0 w-full bg-zinc-800/75 shadow-md backdrop-blur-md sm:w-96"
    >
      <ModalContent>
        <ModalHeader className="border-b border-zinc-700 p-4">
          <div className="text-lg font-semibold text-zinc-300">Chat</div>
        </ModalHeader>
        <ModalBody className="p-0">
          <ul className="flex flex-col gap-1">
            {messages.map((data, index) => {
              return (
                <li key={index}>
                  <div className="px-4 py-2">
                    <b className="block break-words text-sm font-semibold text-rose-300">
                      {data.sender.name}
                    </b>
                    <p
                      className="mt-0.5 break-words text-sm text-zinc-100"
                      dangerouslySetInnerHTML={{
                        __html: linkifyHtml(sanitizeHTML(data.message), {
                          attributes: {
                            target: '_blank',
                            rel: 'noopener noreferrer',
                          },
                          className:
                            'text-blue-300 hover:text-blue-200 active:text-blue-200 underline underline-offset-2',
                        }),
                      }}
                    ></p>
                  </div>
                </li>
              );
            })}
          </ul>
        </ModalBody>
        <ModalFooter className="border-t border-zinc-700 px-4 pb-8 pt-6">
          <form className="relative w-full" onSubmit={onSubmitMessage}>
            <input
              type="text"
              className="w-full rounded-md bg-zinc-950 p-2.5 pr-11 text-sm text-zinc-200 outline-none ring-1 ring-zinc-700 placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-400"
              placeholder="Type a message"
              {...bindMessageInputField}
            />
            <Button
              type="submit"
              isIconOnly
              variant="flat"
              aria-label="Submit chat message"
              className="absolute right-3 top-1/2 h-6 w-6 min-w-0 -translate-y-1/2 rounded-full bg-transparent text-zinc-400"
            >
              <SendPlaneIcon width={24} height={24} />
            </Button>
          </form>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

function sanitizeHTML(htmlString: string) {
  let sanitizedString = '';
  let insideTag = false;

  for (let i = 0; i < htmlString.length; i++) {
    if (htmlString[i] === '<') {
      insideTag = true;
    } else if (htmlString[i] === '>') {
      insideTag = false;
    } else if (!insideTag) {
      if (htmlString[i] === '\n') {
        sanitizedString += ' ';
      } else {
        sanitizedString += htmlString[i];
      }
    }
  }

  return sanitizedString.trim();
}
