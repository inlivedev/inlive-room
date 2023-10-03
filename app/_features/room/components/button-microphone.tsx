'use client';

import { useEffect, useRef, useCallback, useMemo } from 'react';
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
import { usePeerContext } from '@/_features/room/contexts/peer-context';
import { useSelectDevice } from '@/_features/room/hooks/use-select-device';
import ArrowDownFillIcon from '@/_shared/components/icons/arrow-down-fill-icon';

export default function ButtonMicrophone() {
  const { active, toggle } = useToggle(true);
  const { peer } = usePeerContext();
  const didMount = useRef(false);
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
