import { Selection } from '@nextui-org/react';
import { useState, useMemo, Key, useCallback } from 'react';
import { usePeerContext } from '@/_features/room/contexts/peer-context';
import { useParticipantContext } from '@/_features/room/contexts/participant-context';
import { getUserMedia } from '@/_shared/utils/get-user-media';

export const useSelectDevice = (
  devices: MediaDeviceInfo[],
  currentDevice?: MediaDeviceInfo | undefined
) => {
  const { peer } = usePeerContext();
  const { streams } = useParticipantContext();

  const [selectedDeviceKey, setSelectedDeviceKey] = useState<Set<Key>>(
    new Set([])
  );

  const selectDevices = useMemo(() => {
    return devices.map((value) => ({
      key: value.deviceId,
      label: value.label,
      kind: value.kind,
    }));
  }, [devices]);

  const selectedDeviceKeyValue = useMemo(() => {
    return selectedDeviceKey.size === 0 && currentDevice
      ? new Set([currentDevice.deviceId])
      : selectedDeviceKey;
  }, [currentDevice, selectedDeviceKey]);

  const onDeviceSelectionChange = useCallback(
    async (currentKey: Selection) => {
      if (!(currentKey instanceof Set) || currentKey.size === 0) return;

      const currentDevice = selectDevices.find((device) =>
        currentKey.has(device.key)
      );

      const localStream = streams.find((stream) => {
        return stream.source === 'media' && stream.origin === 'local';
      });

      if (!currentDevice || !localStream) {
        throw new Error('Failed to change to the selected device');
      }

      try {
        if (currentDevice.kind === 'audioinput') {
          const mediaStream = await getUserMedia({
            audio: { deviceId: { exact: currentDevice.key } },
          });

          if (peer && mediaStream) {
            const track = mediaStream.getAudioTracks()[0];
            await peer.replaceTrack(track);
            localStream.replaceTrack(track);
            setSelectedDeviceKey(currentKey);
          }
        } else if (currentDevice.kind === 'audiooutput') {
          //
        } else {
          const mediaStream = await getUserMedia({
            video: { deviceId: { exact: currentDevice.key } },
          });

          if (peer && mediaStream) {
            const track = mediaStream.getVideoTracks()[0];
            await peer.replaceTrack(track);
            localStream.replaceTrack(track);
            setSelectedDeviceKey(currentKey);
          }
        }
      } catch (error) {
        console.error(error);
      }
    },
    [peer, selectDevices, streams]
  );

  return {
    onDeviceSelectionChange,
    selectedDeviceKey: selectedDeviceKeyValue,
    selectDevices,
  };
};
