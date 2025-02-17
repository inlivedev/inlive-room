'use client';

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
import CameraOnIcon from '@/_shared/components/icons/camera-on-icon';
import CameraOffIcon from '@/_shared/components/icons/camera-off-icon';
import { useSelectDevice } from '@/_features/room/hooks/use-select-device';
import ArrowDownFillIcon from '@/_shared/components/icons/arrow-down-fill-icon';
import type { ParticipantVideo, DeviceType } from './conference';

export default function ButtonCamera({
  streams,
  deviceTypes,
}: {
  streams: ParticipantVideo[];
  deviceTypes: DeviceType;
}) {
  const {
    selectedDeviceKey: selectedVideoInputKey,
    selectDeviceOptions: selectVideoInputOptions,
    onDeviceSelectionChange: onVideoInputSelectionChange,
  } = useSelectDevice(
    streams,
    deviceTypes.videoInputs,
    deviceTypes.currentVideoInput,
    deviceTypes.setCurrentDevice,
    deviceTypes.activeCamera,
    deviceTypes.activeMic
  );

  const videoInputKey =
    selectedVideoInputKey.size === 0
      ? ['camera-default']
      : selectedVideoInputKey;

  const onDeviceSelectionChange = (selectedKey: Selection) => {
    if (!(selectedKey instanceof Set) || selectedKey.size === 0) return;

    const currentSelected = deviceTypes.devices.find((device) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      return `${device.kind}-${device.deviceId}` === selectedKey.currentKey;
    });

    if (currentSelected?.kind === 'videoinput') {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      onVideoInputSelectionChange(selectedKey, currentSelected);
    }
  };

  const handleClick = () => {
    if (deviceTypes.activeCamera) {
      document.dispatchEvent(new Event('trigger:camera-off'));
      return;
    }
    document.dispatchEvent(new Event('trigger:camera-on'));
    return;
  };

  return (
    <ButtonGroup variant="flat">
      <Button
        isIconOnly
        variant="flat"
        aria-label="Toggle Video Camera"
        className="w-12 bg-zinc-700/70 hover:bg-zinc-600 active:bg-zinc-500"
        onClick={handleClick}
      >
        {deviceTypes.activeCamera ? (
          <CameraOnIcon width={20} height={20} />
        ) : (
          <CameraOffIcon width={20} height={20} className="text-red-500" />
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
          aria-label="Camera options"
          selectionMode="single"
          selectedKeys={videoInputKey}
          onSelectionChange={onDeviceSelectionChange}
        >
          <DropdownSection title="Camera" className="mb-0">
            {deviceTypes.videoInputs.length > 0 ? (
              selectVideoInputOptions.map((item, index) => {
                return (
                  <DropdownItem
                    key={item.key}
                    description={
                      item.key ===
                      `${deviceTypes.currentVideoInput?.kind}-${deviceTypes.currentVideoInput?.deviceId}`
                        ? 'Currently in use'
                        : 'Switch to this device'
                    }
                  >
                    {item.label === 'Default'
                      ? 'System default camera'
                      : item.label || `Camera ${index + 1}`}
                  </DropdownItem>
                );
              })
            ) : (
              <DropdownItem
                key={`camera-default`}
                description="Currently in use"
              >
                System default camera
              </DropdownItem>
            )}
          </DropdownSection>
        </DropdownMenu>
      </Dropdown>
    </ButtonGroup>
  );
}
