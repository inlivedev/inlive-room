'use client';

import { useState, useEffect } from 'react';
import { Button } from "@heroui/react";
import { useChatContext } from '@/_features/room/contexts/chat-context';
import ChatIcon from '@/_shared/components/icons/chat-icon';
import ChatIconWithCircle from '@/_shared/components/icons/chat-icon-with-circle';
import type { Sidebar } from './conference';

export default function ButtonChat({ sidebar }: { sidebar: Sidebar }) {
  const [openChatMenu, setOpenChatMenu] = useState(false);
  const [unreadBadge, setUnreadBadge] = useState(false);

  const { datachannel } = useChatContext();

  useEffect(() => {
    const openRightSidebar = ((event: CustomEventInit) => {
      if (event.detail?.menu === 'chat') {
        setOpenChatMenu(true);
        setUnreadBadge(false);
      }
    }) as EventListener;

    const closeRightSidebar = ((event: CustomEventInit) => {
      if (event.detail?.menu === 'chat') setOpenChatMenu(false);
    }) as EventListener;

    document.addEventListener('open:right-sidebar', openRightSidebar);
    document.addEventListener('close:right-sidebar', closeRightSidebar);

    return () => {
      document.removeEventListener('open:right-sidebar', openRightSidebar);
      document.removeEventListener('close:right-sidebar', closeRightSidebar);
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
      onClick={() => {
        if (sidebar === 'chat') {
          document.dispatchEvent(
            new CustomEvent('close:right-sidebar', {
              detail: { menu: 'chat' },
            })
          );
        } else {
          document.dispatchEvent(
            new CustomEvent('open:right-sidebar', {
              detail: { menu: 'chat' },
            })
          );
        }
      }}
    >
      {unreadBadge ? (
        <ChatIconWithCircle width={22} height={22} />
      ) : (
        <ChatIcon width={20} height={20} />
      )}
    </Button>
  );
}
