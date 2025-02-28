'use client';

import { useMemo } from 'react';
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownSection,
  DropdownItem,
  ButtonGroup,
  Button,
} from '@heroui/react';
import type { Selection } from '@heroui/react';
import MicrophoneOnIcon from '@/_shared/components/icons/microphone-on-icon';
import MicrophoneOffIcon from '@/_shared/components/icons/microphone-off-icon';
import { useSelectDevice } from '@/_features/room/hooks/use-select-device';
import ArrowDownFillIcon from '@/_shared/components/icons/arrow-down-fill-icon';
import type { ParticipantVideo, DeviceType } from './conference';

export default function ButtonMicrophone({
  streams,
  deviceTypes,
}: {
  streams: ParticipantVideo[];
  deviceTypes: DeviceType;
}) {
  const {
    selectedDeviceKey: selectedAudioInputKey,
    selectDeviceOptions: selectAudioInputOptions,
    onDeviceSelectionChange: onAudioInputSelectionChange,
  } = useSelectDevice(
    streams,
    deviceTypes.audioInputs,
    deviceTypes.currentAudioInput,
    deviceTypes.setCurrentDevice,
    deviceTypes.activeCamera,
    deviceTypes.activeMic
  );

  const {
    selectedDeviceKey: selectedAudioOutputKey,
    selectDeviceOptions: selectAudioOutputOptions,
    onDeviceSelectionChange: onAudioOutputSelectionChange,
  } = useSelectDevice(
    streams,
    deviceTypes.audioInputs,
    deviceTypes.currentAudioInput,
    deviceTypes.setCurrentDevice,
    deviceTypes.activeCamera,
    deviceTypes.activeMic
  );

  const speakerSelectionSupport = useMemo(() => {
    if (typeof window === 'undefined') return false;

    if (
      AudioContext.prototype.hasOwnProperty('setSinkId') ||
      HTMLMediaElement.prototype.hasOwnProperty('setSinkId')
    ) {
      return true;
    }

    return false;
  }, []);

  const audioInputKey =
    selectedAudioInputKey.size === 0 ? ['mic-default'] : selectedAudioInputKey;

  const audioOutputKey =
    selectedAudioOutputKey.size === 0
      ? ['speaker-default']
      : selectedAudioOutputKey;

  const selectedDeviceKeys = new Set([...audioInputKey, ...audioOutputKey]);

  const onDeviceSelectionChange = (selectedKeys: Selection) => {
    if (!(selectedKeys instanceof Set) || selectedKeys.size === 0) return;

    const currentSelected = deviceTypes.devices.find(
      (device: MediaDeviceInfo) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        return `${device.kind}-${device.deviceId}` === selectedKeys.currentKey;
      }
    );

    if (currentSelected?.kind === 'audioinput') {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      onAudioInputSelectionChange(selectedKeys, currentSelected);
    } else if (currentSelected?.kind === 'audiooutput') {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      onAudioOutputSelectionChange(selectedKeys, currentSelected);
    }
  };

  const handleClick = () => {
    if (deviceTypes.activeMic) {
      deviceTypes.setActiveMic(false);
      return;
    }

    deviceTypes.setActiveMic(true);
    return;
  };

  return (
    <ButtonGroup variant="flat">
      <Button
        isIconOnly
        variant="flat"
        aria-label="Toggle Microphone"
        className="w-12 bg-zinc-700/70 hover:bg-zinc-600 active:bg-zinc-500"
        onPress={handleClick}
      >
        {deviceTypes.activeMic ? (
          <MicrophoneOnIcon width={20} height={20} />
        ) : (
          <MicrophoneOffIcon width={20} height={20} className="text-red-500" />
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
          aria-label="Audio options"
          selectionMode="multiple"
          selectedKeys={selectedDeviceKeys}
          onSelectionChange={onDeviceSelectionChange}
        >
          <DropdownSection title="Microphone" showDivider>
            {deviceTypes.audioInputs.length > 0 ? (
              selectAudioInputOptions.map((item, index) => {
                return (
                  <DropdownItem
                    key={item.key}
                    description={
                      item.key ===
                      `${deviceTypes.currentAudioInput?.kind}-${deviceTypes.currentAudioInput?.deviceId}`
                        ? 'Currently in use'
                        : 'Switch to this device'
                    }
                  >
                    {item.label === 'Default'
                      ? 'System default microphone'
                      : item.label || `Microphone ${index + 1}`}
                  </DropdownItem>
                );
              })
            ) : (
              <DropdownItem key={`mic-default`} description="Currently in use">
                System default microphone
              </DropdownItem>
            )}
          </DropdownSection>
          <DropdownSection title="Speaker" className="mb-0">
            {deviceTypes.audioOutputs.length > 0 ? (
              speakerSelectionSupport ? (
                selectAudioOutputOptions.map((item, index) => (
                  <DropdownItem
                    key={item.key}
                    description={
                      item.key ===
                      `${deviceTypes.currentAudioOutput?.kind}-${deviceTypes.currentAudioOutput?.deviceId}`
                        ? 'Currently in use'
                        : 'Switch to this device'
                    }
                  >
                    {item.label === 'Default'
                      ? 'System default speaker'
                      : item.label || `Speaker ${index + 1}`}
                  </DropdownItem>
                ))
              ) : (
                <DropdownItem
                  key={`${deviceTypes.currentAudioOutput?.kind}-${deviceTypes.currentAudioOutput?.deviceId}`}
                  description="Currently in use"
                >
                  {!deviceTypes.currentAudioOutput?.label ||
                  deviceTypes.currentAudioOutput?.label === 'Default'
                    ? 'System default speaker'
                    : deviceTypes.currentAudioOutput?.label}
                </DropdownItem>
              )
            ) : (
              <DropdownItem
                key={`speaker-default`}
                description="Currently in use"
              >
                System default speaker
              </DropdownItem>
            )}
          </DropdownSection>
        </DropdownMenu>
      </Dropdown>
    </ButtonGroup>
  );
}
