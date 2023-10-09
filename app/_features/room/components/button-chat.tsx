'use client';

import { Button } from '@nextui-org/react';
import ChatIcon from '@/_shared/components/icons/chat-icon';

export default function ButtonChat() {
  const openChat = () => {
    document.dispatchEvent(new CustomEvent('open:room-chat-menu'));
  };

  return (
    <Button
      isIconOnly
      variant="flat"
      aria-label="Toggle chat menu"
      className="bg-zinc-700/70 hover:bg-zinc-600 active:bg-zinc-500"
      onClick={openChat}
    >
      <ChatIcon width={20} height={20} />
    </Button>
  );
}
