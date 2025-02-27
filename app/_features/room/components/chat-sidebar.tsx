'use client';

import { Button } from "@heroui/react";
import linkifyHtml from 'linkify-html';
import { useForm, type SubmitHandler, useWatch } from 'react-hook-form';
import { useChatContext } from '@/_features/room/contexts/chat-context';
import { useClientContext } from '@/_features/room/contexts/client-context';
import XFillIcon from '@/_shared/components/icons/x-fill-icon';
import SendPlaneIcon from '@/_shared/components/icons/send-plane-icon';
import type { ChatType } from '@/_shared/types/chat';

export default function ChatSidebar() {
  return (
    <div className="grid h-full w-full grid-rows-[auto,1fr]">
      <div className="border-b border-black/25 px-4 py-2.5">
        <div className="flex items-center justify-between">
          <div className="flex-1 text-lg font-semibold text-zinc-900">Chat</div>
          <div className="text-[0px] leading-[0]">
            <Button
              className="h-auto min-h-0 min-w-0 rounded-full bg-transparent p-1.5 text-zinc-900 antialiased hover:bg-zinc-200 active:bg-zinc-100"
              onClick={() =>
                document.dispatchEvent(
                  new CustomEvent('close:right-sidebar', {
                    detail: { menu: 'chat' },
                  })
                )
              }
            >
              <XFillIcon className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-hidden px-5 py-4">
        <ChatListGroup />
      </div>
      <div className="px-4 pb-6">
        <ChatFooter />
      </div>
    </div>
  );
}

const ChatListGroup = () => {
  const { messages } = useChatContext();

  return (
    <div className="grid h-full grid-rows-[1fr,auto]">
      <div className="h-full flex-1 overflow-y-auto">
        <ul className="flex flex-col gap-1">
          <li></li>

          {messages.map((data, index) => {
            return (
              <li key={`${data.sender.client_id}-${index}`}>
                <div className="py-2">
                  <b className="block break-words text-sm font-medium text-zinc-900">
                    {data.sender.name}
                  </b>
                  <p
                    className="mt-0.5 break-words text-sm text-zinc-700"
                    dangerouslySetInnerHTML={{
                      __html: linkifyHtml(sanitizeHTML(data.message), {
                        attributes: {
                          target: '_blank',
                          rel: 'noopener noreferrer',
                        },
                        className:
                          'text-blue-600 underline underline-offset-2 hover:no-underline',
                      }),
                    }}
                  ></p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

type ChatInput = { message: string };

const ChatFooter = () => {
  const { register, handleSubmit, control, reset } = useForm<ChatInput>();
  const { clientID, clientName } = useClientContext();
  const { addMessage, datachannel } = useChatContext();

  const handleSendMessage: SubmitHandler<ChatInput> = async (data) => {
    const { message } = data;

    const formData: ChatType.ChatMessage = {
      sender: {
        client_id: clientID,
        name: clientName,
      },
      message: message,
    };

    addMessage && addMessage(formData);

    if (datachannel) {
      datachannel.send(JSON.stringify(formData));
    }

    reset();
  };

  const inputMessage = useWatch({ control, name: 'message' });
  const inputMessageLength = inputMessage ? inputMessage.trim().length : 0;

  return (
    <form className="relative" onSubmit={handleSubmit(handleSendMessage)}>
      <input
        className="w-full rounded-md bg-zinc-100 p-2.5 pr-11 text-sm text-zinc-700 outline-none ring-1 ring-zinc-100 placeholder:text-zinc-400 focus-visible:ring-1 focus-visible:ring-zinc-400"
        type="text"
        placeholder="Type a message"
        autoComplete="off"
        required
        {...register('message', { required: true })}
      />
      <Button
        className={`absolute right-2 top-1/2 h-auto min-h-0 min-w-0 -translate-y-1/2 rounded-full bg-transparent p-1.5 text-zinc-900 antialiased !opacity-100 outline-0 focus-within:outline-0 hover:bg-zinc-200 focus:outline-0 focus-visible:outline-0 active:bg-zinc-100 ${
          inputMessageLength > 0
            ? 'cursor-pointer text-zinc-900'
            : 'cursor-auto text-zinc-900/50'
        }`}
        type="submit"
        aria-label="Send a message"
        disabled={inputMessageLength === 0}
        isDisabled={inputMessageLength === 0}
        aria-disabled={inputMessageLength === 0}
      >
        <SendPlaneIcon className="h-6 w-6" />
      </Button>
    </form>
  );
};

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
