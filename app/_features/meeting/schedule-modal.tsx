'use client';

import { useEffect } from 'react';
import {
  Modal,
  ModalBody,
  useDisclosure,
  ModalContent,
  ModalHeader,
} from '@nextui-org/react';
import MeetingScheduleForm from '@/_features/meeting/schedule-form';

export default function ScheduleModal() {
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();

  useEffect(() => {
    const openModal = () => {
      onOpen();
    };

    document.addEventListener('open:schedule-meeting-modal', openModal);
    document.addEventListener('close:schedule-meeting-modal', onClose);

    return () => {
      document.removeEventListener('open:schedule-meeting-modal', openModal);
      document.removeEventListener('close:schedule-meeting-modal', onClose);
    };
  }, [onClose, onOpen]);

  return (
    <Modal
      size="md"
      placement="top"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isKeyboardDismissDisabled
      isDismissable={false}
      hideCloseButton
      scrollBehavior="inside"
    >
      <ModalContent className="p-2">
        <ModalHeader className="flex flex-col">
          <h2>Schedule a Meeting</h2>
          <p className="text-sm font-normal text-zinc-400">
            Send a personal email to schedule a meeting
          </p>
        </ModalHeader>
        <ModalBody>
          <MeetingScheduleForm></MeetingScheduleForm>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
