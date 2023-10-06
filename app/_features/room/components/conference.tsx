import ConferenceParticipants from '@/_features/room/components/conference-participants';
import ConferenceActionsBar from '@/_features/room/components/conference-actions-bar';
import styles from '@/_features/room/styles/conference.module.css';

import { useParticipantContext } from '@/_features/room/contexts/participant-context';
import { useDisclosure } from '@nextui-org/react';
import ChatWindow from './chat-window';

export default function Conference() {
  const { streams } = useParticipantContext();
  const {
    isOpen: isChatWindowOpen,
    onOpen: openChatWindow,
    onOpenChange,
  } = useDisclosure();

  const hasScreen = (): boolean => {
    return Object.values(streams).some((stream) => stream.source === 'screen');
  };

  const getClass = (): string => {
    const streamCount = Object.keys(streams).length;
    if (streamCount === 2) {
      return styles['oneonone'];
    } else if (hasScreen()) {
      return styles['presentation'];
    }

    return '';
  };

  return (
    <div className="h-screen w-screen">
      <ChatWindow
        isChatWindowOpen={isChatWindowOpen}
        onOpenChange={onOpenChange}
      />
      <div className={`${styles['participants']} ${getClass()}`}>
        <ConferenceParticipants />
      </div>
      <div className={`${styles['actionbar']}`}>
        <ConferenceActionsBar onChatButton={openChatWindow} />
      </div>
    </div>
  );
}
