import { Selection } from '@nextui-org/react';
import { useState, useMemo, Key, useCallback } from 'react';
import { usePeerContext } from '@/_features/room/contexts/peer-context';
import { useParticipantContext } from '@/_features/room/contexts/participant-context';
import { useDeviceContext } from '@/_features/room/contexts/device-context';
import { getUserMedia } from '@/_shared/utils/get-user-media';

export const useSelectDevice = (
  devices: MediaDeviceInfo[],
  currentActiveDevice: MediaDeviceInfo | undefined
) => {
  const { peer } = usePeerContext();
  const { streams } = useParticipantContext();
  const { setCurrentActiveDevice } = useDeviceContext();

  const [selectedDeviceKeyState, setSelectedDeviceKeyState] = useState<
    Set<Key>
  >(new Set([]));

  const selectedDeviceKeyValue = useMemo(() => {
    return selectedDeviceKeyState.size === 0 && currentActiveDevice
      ? new Set([`${currentActiveDevice.kind}-${currentActiveDevice.deviceId}`])
      : selectedDeviceKeyState;
  }, [currentActiveDevice, selectedDeviceKeyState]);

  const onDeviceSelectionChange = useCallback(
    async (selectedKeys: Selection, currentSelectedDevice: MediaDeviceInfo) => {
      const localStream = streams.find((stream) => {
        return stream.source === 'media' && stream.origin === 'local';
      });

      if (
        !(selectedKeys instanceof Set) ||
        selectedKeys.size === 0 ||
        !(currentSelectedDevice instanceof MediaDeviceInfo) ||
        !localStream
      ) {
        throw new Error('Failed to change to the selected device');
      }

      const selectedDeviceKeys = new Set([...selectedKeys]);

      for (const selectedDeviceKey of selectedDeviceKeys) {
        if (
          `${currentSelectedDevice.kind}-${currentSelectedDevice.deviceId}` !==
          selectedDeviceKey
        ) {
          selectedDeviceKeys.delete(selectedDeviceKey);
        }
      }

      try {
        if (currentSelectedDevice.kind === 'audioinput') {
          for (const audioTrack of localStream.mediaStream.getAudioTracks()) {
            audioTrack.stop();
          }

          const mediaStream = await getUserMedia({
            audio: { deviceId: { exact: currentSelectedDevice.deviceId } },
          });

          if (peer && mediaStream) {
            const track = mediaStream.getAudioTracks()[0];
            await peer.replaceTrack(track);
            localStream.replaceTrack(track);

            setSelectedDeviceKeyState(selectedDeviceKeys);
            setCurrentActiveDevice &&
              setCurrentActiveDevice(currentSelectedDevice);
          }
        } else if (currentSelectedDevice.kind === 'audiooutput') {
          setSelectedDeviceKeyState(selectedDeviceKeys);
          setCurrentActiveDevice &&
            setCurrentActiveDevice(currentSelectedDevice);
        } else {
          for (const videoTrack of localStream.mediaStream.getVideoTracks()) {
            videoTrack.stop();
          }

          const mediaStream = await getUserMedia({
            video: { deviceId: { exact: currentSelectedDevice.deviceId } },
          });

          if (peer && mediaStream) {
            const track = mediaStream.getVideoTracks()[0];
            await peer.replaceTrack(track);
            localStream.replaceTrack(track);

            setSelectedDeviceKeyState(selectedDeviceKeys);
            setCurrentActiveDevice &&
              setCurrentActiveDevice(currentSelectedDevice);
          }
        }
      } catch (error) {
        console.error(error);
      }
    },
    [peer, streams, setCurrentActiveDevice]
  );

  const selectDeviceOptions = useMemo(() => {
    return devices.map((value) => ({
      key: `${value.kind}-${value.deviceId}`,
      label: value.label,
      kind: value.kind,
    }));
  }, [devices]);

  return {
    onDeviceSelectionChange,
    selectedDeviceKey: selectedDeviceKeyValue,
    selectDeviceOptions,
  };
};
