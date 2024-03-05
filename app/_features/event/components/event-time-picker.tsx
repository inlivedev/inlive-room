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
  setTime: any;
  hour: number;
  minute: number;
  event: string;
  heading: string;
  step?: number;
  isEndTime?: boolean;
  startHour?: number;
  startMinute?: number;
}

export function TimePickerModal({
  hour,
  minute,
  event,
  setTime,
  step = 1,
  isEndTime = false,
  startHour = 0,
  startMinute = 0,
  heading,
}: TimePickerModalProps) {
  const dropDownVariant = 'solid';
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const [selectedHour, setSelectHour] = useState(new Set(['0']));
  const [selectedMinute, setSelectMinute] = useState(new Set(['0']));
  const [minuteSelection, setMinuteSelection] = useState<number[]>(
    isEndTime
      ? defaultGenerateMinutes(step)
      : generateEndTimeMinutes(step, startHour, startMinute, hour)
  );

  const [hourSelection, setHourSelection] = useState<number[]>(
    Array.from({ length: 24 - startHour }, (_, a) => a + startHour)
  );

  const selectedHourValue = useMemo(
    () => Array.from(selectedHour).join(', ').replaceAll('_', ' '),
    [selectedHour]
  );

  const selectedMinuteValue = useMemo(
    () => Array.from(selectedMinute).join(', ').replaceAll('_', ' '),
    [selectedMinute]
  );

  useEffect(() => {
    const openModal = () => {
      onOpen();
      setSelectHour(new Set([hour.toString()]));
      setSelectMinute(new Set([minute.toString()]));
    };

    document.addEventListener(event, openModal);

    return () => {
      document.removeEventListener(event, openModal);
    };
  });

  const onConfirm = useCallback(() => {
    setTime({
      hour: parseInt(selectedHourValue),
      minute: parseInt(selectedMinuteValue),
    });
    onClose();
  }, [onClose, selectedHourValue, selectedMinuteValue, setTime]);

  const onCancel = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (startMinute + step >= 60 && isEndTime) {
      setHourSelection(
        Array.from(
          { length: 24 - (startHour + 1) },
          (_, a) => a + (startHour + 1)
        )
      );
      setMinuteSelection(defaultGenerateMinutes(step));
    } else {
      setHourSelection(
        Array.from({ length: 24 - startHour }, (_, a) => a + startHour)
      );

      if (isEndTime) {
        setMinuteSelection(
          generateEndTimeMinutes(step, startHour, startMinute, hour)
        );
      }
    }
  }, [hour, isEndTime, startHour, startMinute, step]);

  useEffect(() => {
    if (startHour == parseInt(selectedHourValue) && isEndTime) {
      const numArray = Math.floor((60 - startMinute) / step);
      setMinuteSelection(
        Array.from(
          { length: numArray },
          (_, index) => startMinute + index * step
        ).filter((minute) => minute > startMinute)
      );
    }
  }, [isEndTime, isOpen, selectedHourValue, startHour, startMinute, step]);

  useEffect(() => {
    if (startHour < parseInt(selectedHourValue) && !isEndTime) {
      setMinuteSelection(defaultGenerateMinutes(step));
    }
  }, [isEndTime, selectedHourValue, startHour, step]);

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      placement="auto"
      hideCloseButton
      isDismissable={false}
    >
      <ModalContent>
        <ModalHeader>{heading}</ModalHeader>
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
                onAction={useCallback(
                  (key: React.Key) => {
                    if (Number(key) > startHour && isEndTime) {
                      setMinuteSelection(defaultGenerateMinutes(step));
                    }
                    if (Number(key) == startHour && isEndTime) {
                      setMinuteSelection(
                        generateEndTimeMinutes(
                          step,
                          startHour,
                          startMinute,
                          Number(key)
                        )
                      );
                    }
                  },
                  [isEndTime, startHour, startMinute, step]
                )}
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
                {hourSelection.map((hour) => (
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
                {minuteSelection.map((min) => (
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

// Generate minutes for the time picker (0 - 59)
function defaultGenerateMinutes(step: number): number[] {
  const minutes = Array.from({ length: 60 / step }, (_, a) => a * step);
  return minutes;
}

// Generate minutes for end time picker
function generateEndTimeMinutes(
  step: number,
  startHour: number,
  startMinute: number,
  currentHour: number
): number[] {
  if (currentHour > startHour) {
    startMinute = 0;
  }

  const numArray = Math.floor((60 - startMinute) / step); // Adjusted to not include the end number

  // if tried to select hour that is same with start hour, minute selector should start without the first starting limit
  if (startHour == currentHour) {
    return Array.from(
      { length: numArray },
      (_, index) => startMinute + index * step
    ).filter((minute) => minute > startMinute);
  }

  return Array.from(
    { length: numArray },
    (_, index) => startMinute + index * step
  );
}
