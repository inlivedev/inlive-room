'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@nextui-org/react';
import { useChatContext } from '@/_features/room/contexts/chat-context';
import ChatIcon from '@/_components/icons/chat-icon';
import ChatIconWithCircle from '@/_components/icons/chat-icon-with-circle';

export default function ButtonChat() {
  const [openChatMenu, setOpenChatMenu] = useState(false);
  const [unreadBadge, setUnreadBadge] = useState(false);

  const { datachannel } = useChatContext();

  const openChat = useCallback(() => {
    document.dispatchEvent(new CustomEvent('open:room-chat-menu'));
  }, []);

  useEffect(() => {
    const onChatMenuOpened = () => {
      setOpenChatMenu(true);
      setUnreadBadge(false);
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
  }, [datachannel, openChatMenu, unreadBadge]);

  useEffect(() => {
    if (!datachannel) return;

    const onMessageAdded = () => {
      if (!openChatMenu && !unreadBadge) {
        setUnreadBadge(true);
      }
    };

    datachannel.addEventListener('message', onMessageAdded);

    return () => {
      datachannel.removeEventListener('message', onMessageAdded);
    };
  }, [datachannel, openChatMenu, unreadBadge]);

  return (
    <Button
      isIconOnly
      variant="flat"
      aria-label="Toggle chat menu"
      className="relative bg-zinc-700/70 hover:bg-zinc-600 active:bg-zinc-500"
      onClick={openChat}
    >
      {unreadBadge ? (
        <ChatIconWithCircle width={22} height={22} />
      ) : (
        <ChatIcon width={20} height={20} />
      )}
    </Button>
  );
}
