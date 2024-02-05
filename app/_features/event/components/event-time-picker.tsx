import {
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Dropdown,
  DropdownTrigger,
  Button,
  DropdownMenu,
  DropdownItem,
  ModalFooter,
} from '@nextui-org/react';
import { useState, useMemo, useCallback, useEffect } from 'react';

interface TimePickerModalProps {
  setTime: React.Dispatch<
    React.SetStateAction<{
      hour: string;
      minute: string;
    }>
  >;
  hour: string;
  minute: string;
  event: string;
  startHourLimit?: number;
  startMinuteLimit?: number;
  title: string;
}

export function TimePickerModal({
  hour,
  minute,
  event,
  setTime,
  startHourLimit = 0,
  startMinuteLimit = 0,
  title,
}: TimePickerModalProps) {
  const dropDownVariant = 'solid';
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const [selectedHour, setSelectHour] = useState(new Set(['0']));
  const [selectedMinute, setSelectMinute] = useState(new Set(['0']));
  const [minuteValue, setMinuteValue] = useState<string[]>(
    Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'))
  );

  const selectedHourValue = useMemo(
    () => Array.from(selectedHour).join(', ').replaceAll('_', ' '),
    [selectedHour]
  );

  const selectedMinuteValue = useMemo(
    () => Array.from(selectedMinute).join(', ').replaceAll('_', ' '),
    [selectedMinute]
  );

  const openModal = useCallback(() => {
    onOpen();
    setSelectHour(new Set([hour.toString()]));
    setSelectMinute(new Set([minute.toString()]));
  }, [onOpen, hour, minute]);

  useEffect(() => {
    document.addEventListener(event, openModal);
  });

  const onConfirm = useCallback(() => {
    setTime({
      hour: selectedHourValue,
      minute: selectedMinuteValue,
    });
    onClose();
  }, [onClose, selectedHourValue, selectedMinuteValue, setTime]);

  const onCancel = useCallback(() => {
    onClose();
  }, [onClose]);

  const hourValue = Array.from({ length: 24 - startHourLimit }, (_, a) =>
    (a + startHourLimit).toString().padStart(2, '0')
  );

  useEffect(() => {
    if (parseInt(selectedHourValue) == startHourLimit) {
      setMinuteValue(
        Array.from({ length: 60 - startMinuteLimit }, (_, i) =>
          (i + startMinuteLimit).toString().padStart(2, '0')
        )
      );
    } else {
      setMinuteValue(
        Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'))
      );
    }
  }, [selectedHourValue, startHourLimit, startMinuteLimit]);

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      placement="auto"
      hideCloseButton
      isDismissable={false}
    >
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalBody>
          <div className="flex items-center justify-center gap-1">
            <Dropdown className="basis-1/2">
              <DropdownTrigger>
                <Button
                  variant={dropDownVariant}
                  className="basis-1/2 rounded-md capitalize"
                >
                  {selectedHourValue}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Hour Dropdown"
                variant={dropDownVariant}
                disallowEmptySelection
                selectionMode="single"
                selectedKeys={selectedHour}
                onSelectionChange={setSelectHour as any}
                style={{
                  maxHeight: '200px',
                  overflowY: 'auto',
                }}
              >
                {hourValue.map((hour) => (
                  <DropdownItem key={hour}>{hour}</DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <p>:</p>
            <Dropdown className="basis-1/2">
              <DropdownTrigger>
                <Button
                  variant={dropDownVariant}
                  className="basis-1/2 rounded-md capitalize"
                >
                  {selectedMinuteValue}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                style={{
                  maxHeight: '200px',
                  overflowY: 'auto',
                }}
                aria-label="Minute Drop Down"
                variant={dropDownVariant}
                disallowEmptySelection
                selectionMode="single"
                selectedKeys={selectedMinute}
                onSelectionChange={setSelectMinute as any}
              >
                {minuteValue.map((min) => (
                  <DropdownItem key={min}>{min}</DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
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
