'use client';

import { useEffect, useRef } from 'react';
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownSection,
  DropdownItem,
  Button,
} from '@nextui-org/react';
import { useToggle } from '@/_shared/hooks/use-toggle';
import MicrophoneOnIcon from '@/_shared/components/icons/microphone-on-icon';
import MicrophoneOffIcon from '@/_shared/components/icons/microphone-off-icon';
import ExpandIcon from '@/_shared/components/icons/expand-icon';
import { usePeerContext } from '@/_features/room/contexts/peer-context';
import { useDeviceContext } from '@/_features/room/contexts/device-context';
import { useSelectDevice } from '@/_features/room/hooks/use-select-device';

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
    <div className="flex items-center text-zinc-200">
      <Button
        color="default"
        variant="bordered"
        className="flex h-full min-w-0 items-center gap-2 rounded rounded-r-none border-1 bg-zinc-900 px-2.5 py-2 hover:bg-zinc-700 active:bg-zinc-600"
        aria-label="Toggle Mic"
        onClick={toggle}
      >
        {active ? (
          <MicrophoneOnIcon width={20} height={20} />
        ) : (
          <MicrophoneOffIcon width={20} height={20} />
        )}
      </Button>
      <Dropdown className="rounded-lg ring-1 ring-zinc-800">
        <DropdownTrigger>
          <Button
            color="default"
            variant="bordered"
            className="flex h-full min-w-0 items-center rounded rounded-l-none border-1 border-zinc-700 bg-zinc-800 p-1 text-xs hover:bg-zinc-700 focus:outline-none active:bg-zinc-600"
          >
            <ExpandIcon width={12} height={12} strokeWidth={2} />
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          variant="faded"
          disallowEmptySelection
          selectionMode="single"
          selectedKeys={selectedDeviceKey}
          onSelectionChange={onDeviceSelectionChange}
        >
          <DropdownSection title="Select a mic" className="mb-0">
            {selectDevices.map((item) => {
              return <DropdownItem key={item.key}>{item.label}</DropdownItem>;
            })}
          </DropdownSection>
        </DropdownMenu>
      </Dropdown>
    </div>
  );
}
