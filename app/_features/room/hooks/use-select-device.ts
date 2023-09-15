import { Selection } from '@nextui-org/react';
import { useState, useMemo, Key, useCallback, useEffect } from 'react';
import { useLocalDevice } from '@/_features/room/hooks/use-local-device';
import { usePeerContext } from '@/_features/room/contexts/peer-context';

export const useSelectDevice = (devices: MediaDeviceInfo[]) => {
  const { mediaStream, getUserMedia } = useLocalDevice();
  const { peer } = usePeerContext();

  const selectDevices = useMemo(() => {
    return devices.map((value) => ({
      key: value.deviceId,
      label: value.label,
      kind: value.kind,
    }));
  }, [devices]);

  const [selectedDeviceKey, setSelectedDeviceKey] = useState<Set<Key>>(
    new Set([])
  );

  const selectedDeviceKeyValue =
    selectedDeviceKey.size === 0 && selectDevices.length > 0
      ? new Set([selectDevices[0].key])
      : selectedDeviceKey;

  const onDeviceSelectionChange = useCallback(
    async (currentKey: Selection) => {
      if (!(currentKey instanceof Set) || currentKey.size === 0) return;

      const currentDevice = selectDevices.find((device) =>
        currentKey.has(device.key)
      );

      if (!currentDevice) {
        throw new Error('Failed to change to the selected device');
      }

      try {
        if (currentDevice.kind === 'videoinput') {
          await getUserMedia({
            audio: {
              deviceId: { exact: currentDevice.key },
            },
          });

          setSelectedDeviceKey(currentKey);
        } else if (currentDevice.kind === 'audioinput') {
          await getUserMedia({
            audio: {
              deviceId: { exact: currentDevice.key },
            },
          });

          setSelectedDeviceKey(currentKey);
        } else if (currentDevice.kind === 'audiooutput') {
        }
      } catch (error) {
        console.error(error);
      }
    },
    [getUserMedia, selectDevices]
  );

  const replaceTrack = useCallback(
    async (track: MediaStreamTrack) => {
      if (!peer) return;

      const peerConnection = peer.getPeerConnection();

      if (!peerConnection) return;

      for (const transceiver of peerConnection.getTransceivers()) {
        if (
          transceiver.sender.track &&
          transceiver.sender.track.kind === track.kind
        ) {
          await transceiver.sender.replaceTrack(track);
        }
      }
    },
    [peer]
  );

  useEffect(() => {
    if (mediaStream instanceof MediaStream) {
      (async () => {
        for (const track of mediaStream.getTracks()) {
          await replaceTrack(track);
        }
      })();
    }
  }, [mediaStream, replaceTrack]);

  return {
    onDeviceSelectionChange,
    selectedDeviceKey: selectedDeviceKeyValue,
    selectDevices,
  };
};
