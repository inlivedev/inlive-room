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
import { useCallback, useEffect, useState } from 'react';

interface DatePickerModalProps {
  startDate: Date;
  setStartDate: React.Dispatch<React.SetStateAction<Date>>;
}

export function DatePickerModal({
  startDate,
  setStartDate,
}: DatePickerModalProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();

  const openModal = useCallback(() => {
    onOpen();
  }, [onOpen]);

  const onConfirm = useCallback(() => {
    setStartDate(selectedDate);
    onClose();
  }, [onClose, selectedDate, setStartDate]);

  const onCancel = useCallback(() => {
    setSelectedDate(startDate);
    onClose();
  }, [onClose, startDate]);

  useEffect(() => {
    document.addEventListener('open:event-date-picker-modal', openModal);
  });

  const currentDate = new Date();
  const yesterday = new Date(currentDate.setDate(currentDate.getDate() - 1));

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      placement="auto"
      hideCloseButton
      isDismissable={false}
    >
      <ModalContent>
        <ModalHeader>Set event date</ModalHeader>
        <ModalBody>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => {
              if (date) {
                setSelectedDate(date);
                console.log(setSelectedDate);
              }
            }}
            inline
            excludeDateIntervals={[{ start: new Date('0'), end: yesterday }]}
          />
        </ModalBody>
        <ModalFooter>
          <Button className="rounded-md px-4 py-2 text-sm" onClick={onCancel}>
            Cancel
          </Button>

          <Button
            className="rounded-md bg-red-800 px-4  py-2 text-sm hover:bg-red-500 active:bg-red-600"
            onClick={onConfirm}
          >
            Confirm
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
