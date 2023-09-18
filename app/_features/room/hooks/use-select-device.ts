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

  const [selectedDeviceKey, setSelectedDeviceKey] = useState<Set<Key>>(
    new Set([])
  );

  const selectedDeviceKeyValue = useMemo(() => {
    return selectedDeviceKey.size === 0 && currentActiveDevice
      ? new Set([currentActiveDevice.deviceId])
      : selectedDeviceKey;
  }, [currentActiveDevice, selectedDeviceKey]);

  const onDeviceSelectionChange = useCallback(
    async (currentKey: Selection) => {
      if (!(currentKey instanceof Set) || currentKey.size === 0) return;

      const currentActiveDevice = devices.find((device) =>
        currentKey.has(device.deviceId)
      );

      const localStream = streams.find((stream) => {
        return stream.source === 'media' && stream.origin === 'local';
      });

      if (!currentActiveDevice || !localStream) {
        throw new Error('Failed to change to the selected device');
      }

      try {
        if (currentActiveDevice.kind === 'audioinput') {
          const mediaStream = await getUserMedia({
            audio: { deviceId: { exact: currentActiveDevice.deviceId } },
          });

          if (peer && mediaStream) {
            const track = mediaStream.getAudioTracks()[0];
            await peer.replaceTrack(track);
            localStream.replaceTrack(track);
            setSelectedDeviceKey(currentKey);
            window.sessionStorage.setItem(
              'device:selected-audio-input-id',
              currentActiveDevice.deviceId
            );
            setCurrentActiveDevice &&
              setCurrentActiveDevice(currentActiveDevice);
          }
        } else if (currentActiveDevice.kind === 'audiooutput') {
          //TODO: audio output selection
        } else {
          const mediaStream = await getUserMedia({
            video: { deviceId: { exact: currentActiveDevice.deviceId } },
          });

          if (peer && mediaStream) {
            const track = mediaStream.getVideoTracks()[0];
            await peer.replaceTrack(track);
            localStream.replaceTrack(track);
            setSelectedDeviceKey(currentKey);
            window.sessionStorage.setItem(
              'device:selected-video-input-id',
              currentActiveDevice.deviceId
            );
            setCurrentActiveDevice &&
              setCurrentActiveDevice(currentActiveDevice);
          }
        }
      } catch (error) {
        console.error(error);
      }
    },
    [peer, devices, streams, setCurrentActiveDevice]
  );

  const selectDevices = useMemo(() => {
    return devices.map((value) => ({
      key: value.deviceId,
      label: value.label,
      kind: value.kind,
    }));
  }, [devices]);

  return {
    onDeviceSelectionChange,
    selectedDeviceKey: selectedDeviceKeyValue,
    selectDevices,
  };
};
