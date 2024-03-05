import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from '@nextui-org/react';
import DatePicker from 'react-datepicker';
import '../styles/date-picker.css';
import { useCallback, useEffect, useState, useRef } from 'react';

export default function DatePickerModal({
  heading,
  type,
}: {
  heading: string;
  type: string;
}) {
  const currentDate = useRef(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();

  const onConfirm = useCallback(() => {
    document.dispatchEvent(
      new CustomEvent('trigger:date-picker-confirmation', {
        detail: {
          selectedDate,
          type,
        },
      })
    );
    onClose();
  }, [onClose, selectedDate, type]);

  const onCancel = useCallback(() => {
    setSelectedDate(currentDate.current);
    onClose();
  }, [onClose]);

  useEffect(() => {
    const openModal = ((event: CustomEvent) => {
      const detail = event.detail || {};
      currentDate.current = detail.currentDate;
      setSelectedDate(currentDate.current);

      onOpen();
    }) as EventListener;

    document.addEventListener('open:date-picker-modal', openModal);

    return () => {
      document.removeEventListener('open:date-picker-modal', openModal);
    };
  }, [onOpen]);

  const today = new Date();
  const yesterday = new Date(today.setDate(today.getDate() - 1));

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      placement="auto"
      isDismissable={false}
      hideCloseButton={true}
    >
      <ModalContent>
        <ModalHeader>{heading}</ModalHeader>
        <ModalBody>
          <div className="min-h-[340px]">
            <DatePicker
              selected={selectedDate}
              onChange={(date) => {
                if (date) {
                  setSelectedDate(date);
                }
              }}
              inline
              excludeDateIntervals={[{ start: new Date(0), end: yesterday }]}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            className="rounded-md bg-zinc-800 px-4 py-2 text-sm font-medium antialiased hover:bg-zinc-700 active:bg-zinc-600"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            className="rounded-md bg-red-800 px-4 py-2 text-sm font-medium antialiased hover:bg-red-700 active:bg-red-600"
            onClick={onConfirm}
          >
            Confirm
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
