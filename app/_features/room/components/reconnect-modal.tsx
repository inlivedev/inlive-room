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

export default function ReconncectModal() {
  const { sseConnection } = useConnectionContext();
  const { peer } = usePeerContext();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  useEffect(() => {
    if (!sseConnection) {
      onOpen();
      console.log('Reconnect Open');
      console.log(isOpen);
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
      <ModalContent>
        <ModalHeader></ModalHeader>
        <ModalBody>
          <div>
            <h1> you have been disconnected</h1>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            onClick={_onClick}
            className="bg-red-600/70 hover:bg-red-600 focus:outline-zinc-100 active:bg-red-500"
            aria-label="reconnect to this meeting room"
          >
            Reconnect
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
