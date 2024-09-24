'use client';

import { useEffect, useState } from 'react';
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
  const [editMode, setEditMode] = useState(true);
  const [size, setSize] = useState<'full' | 'md'>('md');
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
  });

  useEffect(() => {
    // Handler to update the screen size
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
      });
    };

    // Add event listener for screen resize
    window.addEventListener('resize', handleResize);

    // Cleanup the event listener on component unmount
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const openModal = () => {
      if (screenSize.width < 640) {
        setSize('full');
      } else {
        setSize('md');
      }
      onOpen();
    };

    document.addEventListener('open:schedule-meeting-modal', openModal);
    document.addEventListener('close:schedule-meeting-modal', onClose);

    document.addEventListener('open:schedule-meeting-modal-detail', () => {
      setEditMode(false);
      openModal();
    });

    return () => {
      document.removeEventListener('open:schedule-meeting-modal', openModal);
      document.removeEventListener('close:schedule-meeting-modal', onClose);
    };
  }, [onClose, onOpen, screenSize.width]);

  return (
    <Modal
      size={size}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isKeyboardDismissDisabled
      isDismissable={false}
      scrollBehavior="inside"
    >
      <ModalContent className="p-2">
        <ModalHeader className="flex flex-col">
          {editMode ? (
            <div>
              <h2>Schedule a Meeting</h2>
              <p className="text-sm font-normal text-zinc-400">
                Send a personal email to schedule a meeting
              </p>
            </div>
          ) : (
            <h2>Event Details</h2>
          )}
        </ModalHeader>
        <ModalBody>
          <MeetingScheduleForm></MeetingScheduleForm>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
