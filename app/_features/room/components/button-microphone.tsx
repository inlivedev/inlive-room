'use client';

import { useEffect, useCallback, useMemo } from 'react';
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
import MicrophoneOnIcon from '@/_shared/components/icons/microphone-on-icon';
import MicrophoneOffIcon from '@/_shared/components/icons/microphone-off-icon';
import { useSelectDevice } from '@/_features/room/hooks/use-select-device';
import ArrowDownFillIcon from '@/_shared/components/icons/arrow-down-fill-icon';

export default function ButtonMicrophone() {
  const { active, setActive, setInActive } = useToggle(true);
  const {
    currentAudioInput,
    currentAudioOutput,
    audioInputs,
    audioOutputs,
    devices,
  } = useDeviceContext();

  const {
    selectedDeviceKey: selectedAudioInputKey,
    selectDeviceOptions: selectAudioInputOptions,
    onDeviceSelectionChange: onAudioInputSelectionChange,
  } = useSelectDevice(audioInputs, currentAudioInput);

  const {
    selectedDeviceKey: selectedAudioOutputKey,
    selectDeviceOptions: selectAudioOutputOptions,
    onDeviceSelectionChange: onAudioOutputSelectionChange,
  } = useSelectDevice(audioOutputs, currentAudioOutput);

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

  const selectedDeviceKeys = useMemo(() => {
    return new Set([...selectedAudioInputKey, ...selectedAudioOutputKey]);
  }, [selectedAudioInputKey, selectedAudioOutputKey]);

  const onDeviceSelectionChange = useCallback(
    (selectedKeys: Selection) => {
      if (!(selectedKeys instanceof Set) || selectedKeys.size === 0) return;

      const currentSelected = devices.find((device) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        return `${device.kind}-${device.deviceId}` === selectedKeys.currentKey;
      });

      if (currentSelected?.kind === 'audioinput') {
        onAudioInputSelectionChange(selectedKeys, currentSelected);
      } else if (currentSelected?.kind === 'audiooutput') {
        onAudioOutputSelectionChange(selectedKeys, currentSelected);
      }
    },
    [devices, onAudioInputSelectionChange, onAudioOutputSelectionChange]
  );

  const handleClick = useCallback(() => {
    if (active) {
      document.dispatchEvent(new CustomEvent('trigger:turnoff-mic'));
    } else {
      document.dispatchEvent(new CustomEvent('trigger:turnon-mic'));
    }
  }, [active]);

  useEffect(() => {
    const onTurnOnMic = () => setActive();
    const onTurnOffMic = () => setInActive();
    document.addEventListener('trigger:turnon-mic', onTurnOnMic);
    document.addEventListener('trigger:turnoff-mic', onTurnOffMic);

    return () => {
      document.removeEventListener('trigger:turnon-mic', onTurnOnMic);
      document.removeEventListener('trigger:turnoff-mic', onTurnOffMic);
    };
  }, [setActive, setInActive]);

  return (
    <ButtonGroup variant="flat">
      <Button
        isIconOnly
        variant="flat"
        aria-label="Toggle Microphone"
        className="w-12 bg-zinc-700/70 hover:bg-zinc-600 active:bg-zinc-500"
        onClick={handleClick}
      >
        {active ? (
          <MicrophoneOnIcon width={20} height={20} />
        ) : (
          <MicrophoneOffIcon width={20} height={20} className="text-red-500" />
        )}
      </Button>
      {audioInputs.length > 0 || audioOutputs.length > 0 ? (
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
            disabledKeys={['no-mic', 'no-speaker']}
          >
            <DropdownSection title="Microphone" showDivider>
              {audioInputs.length > 0 ? (
                selectAudioInputOptions.map((item, index) => {
                  return (
                    <DropdownItem
                      key={item.key}
                      description={
                        item.key ===
                        `${currentAudioInput?.kind}-${currentAudioInput?.deviceId}`
                          ? 'Currently in use'
                          : 'Switch to this device'
                      }
                    >
                      {item.label === 'Default'
                        ? 'Default Microphone'
                        : item.label || `Microphone ${index + 1}`}
                    </DropdownItem>
                  );
                })
              ) : (
                <DropdownItem key={`no-mic`}>
                  <p className="text-xs">No microphone available</p>
                </DropdownItem>
              )}
            </DropdownSection>
            <DropdownSection title="Speaker" className="mb-0">
              {audioOutputs.length > 0 ? (
                speakerSelectionSupport ? (
                  selectAudioOutputOptions.map((item, index) => (
                    <DropdownItem
                      key={item.key}
                      description={
                        item.key ===
                        `${currentAudioOutput?.kind}-${currentAudioOutput?.deviceId}`
                          ? 'Currently in use'
                          : 'Switch to this device'
                      }
                    >
                      {item.label === 'Default'
                        ? 'Default Speaker'
                        : item.label || `Speaker ${index + 1}`}
                    </DropdownItem>
                  ))
                ) : (
                  <DropdownItem
                    key={`${currentAudioOutput?.kind}-${currentAudioOutput?.deviceId}`}
                    description="Currently in use"
                  >
                    {!currentAudioOutput?.label ||
                    currentAudioOutput?.label === 'Default'
                      ? 'Default Speaker'
                      : currentAudioOutput?.label}
                  </DropdownItem>
                )
              ) : (
                <DropdownItem key={`no-speaker`}>
                  <p className="text-xs">No speaker available</p>
                </DropdownItem>
              )}
            </DropdownSection>
          </DropdownMenu>
        </Dropdown>
      ) : null}
    </ButtonGroup>
  );
}
