// TODO : Add ability to Observe the Connection Signal / Bandwidth

import { useEffect } from 'react';
import {
  useDisclosure,
  Modal,
  ModalContent,
  ModalBody,
  ModalFooter,
  Button,
  ModalHeader,
} from '@heroui/react';
import { usePeerContext } from '@/_features/room/contexts/peer-context';
import PlugDisconnectedFillIcon from '@/_shared/components/icons/plug-disconnected-fill-icon';

export default function ReconnectModal() {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const { connectionState } = usePeerContext();

  useEffect(() => {
    if (connectionState === 'disconnected') {
      onOpen();
    } else if (connectionState === 'connected' && isOpen) {
      onClose();
    }
  }, [connectionState, onOpen, isOpen, onClose]);

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isDismissable={false}
      hideCloseButton={true}
    >
      <ModalContent className="ring-1 ring-zinc-800">
        <ModalHeader>Disconnected</ModalHeader>
        <ModalBody>
          <div className="flex flex-col gap-2">
            <div className="flex w-max items-center gap-2 rounded-sm bg-zinc-950 p-2 text-xs text-red-600/70 ring-1 ring-zinc-800">
              <PlugDisconnectedFillIcon
                width={24}
                height={24}
              ></PlugDisconnectedFillIcon>
            </div>
            <div className="flex items-center gap-2 rounded-sm p-1 text-sm">
              It seems like we&apos;ve lost connection to the room. Please check
              your internet connection and try again.
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            onPress={() => window.location.reload()}
            className="w-full rounded bg-red-600/70 hover:bg-red-600 focus:outline-zinc-100 active:bg-red-500 sm:w-max"
            aria-label="Reload this page"
          >
            Reload this page
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
