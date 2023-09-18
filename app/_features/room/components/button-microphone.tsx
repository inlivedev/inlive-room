'use client';

import { useEffect, useRef } from 'react';
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownSection,
  DropdownItem,
  ButtonGroup,
  Button,
} from '@nextui-org/react';
import { useToggle } from '@/_shared/hooks/use-toggle';
import MicrophoneOnIcon from '@/_shared/components/icons/microphone-on-icon';
import MicrophoneOffIcon from '@/_shared/components/icons/microphone-off-icon';
import { usePeerContext } from '@/_features/room/contexts/peer-context';
import { useDeviceContext } from '@/_features/room/contexts/device-context';
import { useSelectDevice } from '@/_features/room/hooks/use-select-device';
import ArrowDownFillIcon from '@/_shared/components/icons/arrow-down-fill-icon';

export default function ButtonMicrophone() {
  const { active, toggle } = useToggle(true);
  const { peer } = usePeerContext();
  const { audioInputs, currentAudioInput } = useDeviceContext();
  const didMount = useRef(false);
  const { selectedDeviceKey, selectDevices, onDeviceSelectionChange } =
    useSelectDevice(audioInputs, currentAudioInput);

  useEffect(() => {
    if (!peer) return;

    if (didMount.current) {
      if (active) {
        peer.turnOnMic();
      } else {
        peer.turnOffMic();
      }
    } else {
      didMount.current = true;
    }
  }, [active, peer]);

  return (
    <ButtonGroup variant="flat">
      <Button
        isIconOnly
        variant="flat"
        aria-label="Toggle Microphone"
        className="w-12 bg-zinc-700/70 hover:bg-zinc-600 active:bg-zinc-500"
        onClick={toggle}
      >
        {active ? (
          <MicrophoneOnIcon width={20} height={20} />
        ) : (
          <MicrophoneOffIcon width={20} height={20} />
        )}
      </Button>
      <Dropdown placement="bottom" className=" ring-1 ring-zinc-800/70">
        <DropdownTrigger>
          <Button
            isIconOnly
            className="w-8 min-w-0 bg-zinc-700/70 hover:bg-zinc-600 active:bg-zinc-500"
          >
            <ArrowDownFillIcon className="h-3.5 w-3.5" />
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          disallowEmptySelection
          aria-label="Microphone options"
          selectionMode="single"
          selectedKeys={selectedDeviceKey}
          onSelectionChange={onDeviceSelectionChange}
        >
          <DropdownSection title="Select a microphone" className="mb-0">
            {selectDevices.map((item, index) => {
              return (
                <DropdownItem
                  key={item.key}
                  description={
                    item.key === currentAudioInput?.deviceId
                      ? 'Currently in use'
                      : 'Switch to this device'
                  }
                >
                  {item.label || `Microphone ${index}`}
                </DropdownItem>
              );
            })}
          </DropdownSection>
        </DropdownMenu>
      </Dropdown>
    </ButtonGroup>
  );
}
