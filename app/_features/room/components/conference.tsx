import ConferenceParticipants from '@/_features/room/components/conference-participants';
import ConferenceActionsBar from '@/_features/room/components/conference-actions-bar';
import styles from '@/_features/room/styles/conference.module.css';

import { useParticipantContext } from '@/_features/room/contexts/participant-context';
import {
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from '@nextui-org/react';
import ChatWindowBody from './chat-window';

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
            <Input></Input>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <div className={`${styles['participants']} ${getClass()}`}>
        <ConferenceParticipants />
      </div>
      <div className={`${styles['actionbar']}`}>
        <ConferenceActionsBar onChatButton={openChatWindow} />
      </div>
    </div>
  );
}
