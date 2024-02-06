import {
  useDisclosure,
  Modal,
  ModalContent,
  ModalBody,
  ModalFooter,
  Button,
  ModalHeader,
} from '@nextui-org/react';
import { useConnectionContext } from '../contexts/connection-status-context';
import { useEffect } from 'react';
import { usePeerContext } from '../contexts/peer-context';
import PlugDisconnectedFillIcon from '@/_shared/components/icons/plug-disconnected-fill-icon';

export default function ReconncectModal() {
  const { sseConnection } = useConnectionContext();
  const { peer } = usePeerContext();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  useEffect(() => {
    if (!sseConnection) {
      onOpen();
    }
  });

  const _onClick = async () => {
    peer?.disconnect();
    location.reload();
  };

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
            <div className="flex w-max items-center gap-2 rounded-sm p-1 text-sm">
              {
                "It seems like we've lost connection to the meeting room. Please check your internet connection and try again."
              }
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            onClick={_onClick}
            className="w-full rounded bg-red-600/70 hover:bg-red-600 focus:outline-zinc-100 active:bg-red-500 sm:w-max"
            aria-label="reconnect to this meeting room"
          >
            Reconnect
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
