'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button, Badge } from '@nextui-org/react';
import { useChatContext } from '@/_features/room/contexts/chat-context';
import ChatIcon from '@/_shared/components/icons/chat-icon';

export default function ButtonChat() {
  const [openChatMenu, setOpenChatMenu] = useState(false);
  const [showBadge, setShowBadge] = useState(false);

  const { datachannel } = useChatContext();

  const openChat = useCallback(() => {
    document.dispatchEvent(new CustomEvent('open:room-chat-menu'));
  }, []);

  useEffect(() => {
    const onChatMenuOpened = () => {
      setOpenChatMenu(true);
      setShowBadge(false);
    };

    const onChatMenuClosed = () => {
      setOpenChatMenu(false);
    };

    document.addEventListener('open:room-chat-menu', onChatMenuOpened);
    document.addEventListener('close:room-chat-menu', onChatMenuClosed);

    return () => {
      document.removeEventListener('open:room-chat-menu', onChatMenuOpened);
      document.removeEventListener('close:room-chat-menu', onChatMenuClosed);
    };
  }, [datachannel, openChatMenu, showBadge]);

  useEffect(() => {
    if (!datachannel) return;

    const onMessageAdded = () => {
      if (!openChatMenu && !showBadge) {
        setShowBadge(true);
      }
    };

    datachannel.addEventListener('message', onMessageAdded);

    return () => {
      datachannel.removeEventListener('message', onMessageAdded);
    };
  }, [datachannel, openChatMenu, showBadge]);

  return (
    <Badge
      content=""
      shape="circle"
      placement="top-right"
      className="bg-sky-500"
      isInvisible={!showBadge}
    >
      <Button
        isIconOnly
        variant="flat"
        aria-label="Toggle chat menu"
        className="bg-zinc-700/70 hover:bg-zinc-600 active:bg-zinc-500"
        onClick={openChat}
      >
        <ChatIcon width={20} height={20} />
      </Button>
    </Badge>
  );
}
