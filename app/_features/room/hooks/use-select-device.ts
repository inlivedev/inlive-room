import { useState, useMemo, useCallback } from 'react';
import { usePeerContext } from '@/_features/room/contexts/peer-context';
import { AudioOutputContext } from '@/_features/room/contexts/device-context';
import { getUserMedia } from '@/_shared/utils/get-user-media';
import { ParticipantVideo } from '../components/conference';

export const useSelectDevice = (
  streams: ParticipantVideo[],
  devices: MediaDeviceInfo[],
  currentActiveDevice: MediaDeviceInfo | undefined,
  setCurrentDevice: (deviceInfo: MediaDeviceInfo) => void,
  activeCamera: boolean,
  activeMic: boolean
) => {
  const { peer } = usePeerContext();

  const [selectedDeviceKeyState, setSelectedDeviceKeyState] = useState<
    Set<string>
  >(new Set([]));

  const selectedDeviceKeyValue = useMemo(() => {
    return selectedDeviceKeyState.size === 0 && currentActiveDevice
      ? new Set([`${currentActiveDevice.kind}-${currentActiveDevice.deviceId}`])
      : selectedDeviceKeyState;
  }, [currentActiveDevice, selectedDeviceKeyState]);

  const onDeviceSelectionChange = useCallback(
    async (
      selectedKeys: Set<string>,
      currentSelectedDevice: MediaDeviceInfo
    ) => {
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
          const audioTrack = localStream.mediaStream.getAudioTracks()[0];
          if (audioTrack) {
            audioTrack.stop();
          }

          const mediaStream = await getUserMedia({
            audio: { deviceId: { exact: currentSelectedDevice.deviceId } },
          });

          if (peer && mediaStream) {
            const newTrack = mediaStream.getAudioTracks()[0];
            if (audioTrack) {
              await peer.replaceTrack(audioTrack, newTrack);
            }
            localStream.replaceTrack(newTrack);
            if (!activeMic) peer.turnOffMic();

            setSelectedDeviceKeyState(selectedDeviceKeys);
            setCurrentDevice(currentSelectedDevice);
          }
        } else if (currentSelectedDevice.kind === 'audiooutput') {
          if (
            AudioContext.prototype.hasOwnProperty('setSinkId') &&
            AudioOutputContext
          ) {
            const sinkId =
              currentSelectedDevice.deviceId !== 'default'
                ? currentSelectedDevice.deviceId
                : '';

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-ignore
            await AudioOutputContext.setSinkId(sinkId);
          }

          setSelectedDeviceKeyState(selectedDeviceKeys);
          setCurrentDevice(currentSelectedDevice);
        } else if (currentSelectedDevice.kind === 'videoinput') {
          const videoTrack = localStream.mediaStream.getVideoTracks()[0];
          if (videoTrack) {
            videoTrack.stop();
          }

          const mediaStream = await getUserMedia({
            video: { deviceId: { exact: currentSelectedDevice.deviceId } },
          });

          if (peer && mediaStream) {
            const track = mediaStream.getVideoTracks()[0];
            if (videoTrack) {
              await peer.replaceTrack(videoTrack, track);
            }
            localStream.replaceTrack(track);
            if (!activeCamera) peer.turnOffCamera();

            setSelectedDeviceKeyState(selectedDeviceKeys);
            setCurrentDevice(currentSelectedDevice);
          }
        }
      } catch (error) {
        console.error(error);
      }
    },
    [peer, streams, setCurrentDevice, activeCamera, activeMic]
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
