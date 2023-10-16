'use client';

import { useEffect, useCallback } from 'react';
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownSection,
  DropdownItem,
  ButtonGroup,
  Button,
} from '@nextui-org/react';
import type { Selection } from '@nextui-org/react';
import { useToggle } from '@/_shared/hooks/use-toggle';
import { useDeviceContext } from '@/_features/room/contexts/device-context';
import CameraOnIcon from '@/_shared/components/icons/camera-on-icon';
import CameraOffIcon from '@/_shared/components/icons/camera-off-icon';
import { useSelectDevice } from '@/_features/room/hooks/use-select-device';
import ArrowDownFillIcon from '@/_shared/components/icons/arrow-down-fill-icon';

export default function ButtonCamera() {
  const { active, setActive, setInActive } = useToggle(true);
  const { currentVideoInput, videoInputs, devices } = useDeviceContext();

  const {
    selectedDeviceKey: selectedVideoInputKey,
    selectDeviceOptions: selectVideoInputOptions,
    onDeviceSelectionChange: onVideoInputSelectionChange,
  } = useSelectDevice(videoInputs, currentVideoInput);

  const onDeviceSelectionChange = useCallback(
    (selectedKey: Selection) => {
      if (!(selectedKey instanceof Set) || selectedKey.size === 0) return;

      const currentSelected = devices.find((device) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        return `${device.kind}-${device.deviceId}` === selectedKey.currentKey;
      });

      if (currentSelected?.kind === 'videoinput') {
        onVideoInputSelectionChange(selectedKey, currentSelected);
      }
    },
    [devices, onVideoInputSelectionChange]
  );

  const handleClick = useCallback(() => {
    if (active) {
      document.dispatchEvent(new CustomEvent('trigger:turnoff-camera'));
    } else {
      document.dispatchEvent(new CustomEvent('trigger:turnon-camera'));
    }
  }, [active]);

  useEffect(() => {
    const onTurnOnCamera = () => setActive();
    const onTurnOffCamera = () => setInActive();
    document.addEventListener('trigger:turnon-camera', onTurnOnCamera);
    document.addEventListener('trigger:turnoff-camera', onTurnOffCamera);

    return () => {
      document.removeEventListener('trigger:turnon-camera', onTurnOnCamera);
      document.removeEventListener('trigger:turnoff-camera', onTurnOffCamera);
    };
  }, [setActive, setInActive]);

  return (
    <ButtonGroup variant="flat">
      <Button
        isIconOnly
        variant="flat"
        aria-label="Toggle Video Camera"
        className="w-12 bg-zinc-700/70 hover:bg-zinc-600 active:bg-zinc-500"
        onClick={handleClick}
      >
        {active ? (
          <CameraOnIcon width={20} height={20} />
        ) : (
          <CameraOffIcon width={20} height={20} />
        )}
      </Button>
      {videoInputs.length > 0 ? (
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
            aria-label="Camera options"
            selectionMode="single"
            selectedKeys={selectedVideoInputKey}
            onSelectionChange={onDeviceSelectionChange}
          >
            <DropdownSection title="Camera" className="mb-0">
              {selectVideoInputOptions.map((item, index) => {
                return (
                  <DropdownItem
                    key={item.key}
                    description={
                      item.key ===
                      `${currentVideoInput?.kind}-${currentVideoInput?.deviceId}`
                        ? 'Currently in use'
                        : 'Switch to this device'
                    }
                  >
                    {item.label === 'Default'
                      ? 'Default Camera'
                      : item.label || `Camera ${index + 1}`}
                  </DropdownItem>
                );
              })}
            </DropdownSection>
          </DropdownMenu>
        </Dropdown>
      ) : null}
    </ButtonGroup>
  );
}
