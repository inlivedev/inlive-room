'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { usePeerContext } from '@/_features/room/contexts/peer-context';

const defaultValue = {
  currentAudioInput: undefined as MediaDeviceInfo | undefined,
  currentAudioOutput: undefined as MediaDeviceInfo | undefined,
  currentVideoInput: undefined as MediaDeviceInfo | undefined,
  audioInputs: [] as MediaDeviceInfo[],
  audioOutputs: [] as MediaDeviceInfo[],
  videoInputs: [] as MediaDeviceInfo[],
  devices: [] as MediaDeviceInfo[],
};

type SetCurrentActiveDeviceType = (deviceInfo: MediaDeviceInfo) => void;

const DeviceContext = createContext({
  ...defaultValue,
  setCurrentActiveDevice: undefined as SetCurrentActiveDeviceType | undefined,
});

export const useDeviceContext = () => {
  return useContext(DeviceContext);
};

export function DeviceProvider({
  children,
  localStream,
}: {
  children: React.ReactNode;
  localStream?: MediaStream;
}) {
  const { peer } = usePeerContext();
  const [devicesState, setDevicesState] = useState(defaultValue);

  const setCurrentActiveDevice = useCallback((deviceInfo: MediaDeviceInfo) => {
    setDevicesState((prevData) => {
      const newData = { ...prevData };

      if (deviceInfo.kind === 'audioinput') {
        newData.currentAudioInput = deviceInfo;
      } else if (deviceInfo.kind === 'audiooutput') {
        newData.currentAudioOutput = deviceInfo;
      } else if (deviceInfo.kind === 'videoinput') {
        newData.currentVideoInput = deviceInfo;
      }

      return { ...newData };
    });
  }, []);

  useEffect(() => {
    if (peer) {
      const getDevices = async () => {
        const devices = await navigator.mediaDevices.enumerateDevices();

        const audioInputs = [];
        const audioOutputs = [];
        const videoInputs = [];

        for (const device of devices) {
          if (device.kind === 'audioinput') {
            audioInputs.push(device);
          } else if (device.kind === 'audiooutput') {
            audioOutputs.push(device);
          } else {
            videoInputs.push(device);
          }
        }

        let currentAudioInput: MediaDeviceInfo | undefined =
          devicesState.currentAudioInput
            ? devicesState.currentAudioInput
            : audioInputs[0];
        let currentVideoInput: MediaDeviceInfo | undefined =
          devicesState.currentVideoInput
            ? devicesState.currentVideoInput
            : videoInputs[0];

        const currentAudioOutput: MediaDeviceInfo | undefined =
          devicesState.currentAudioOutput
            ? devicesState.currentAudioOutput
            : audioOutputs[0];

        if (localStream) {
          const currentAudioInputId = localStream
            .getAudioTracks()[0]
            ?.getSettings().deviceId;

          const currentVideoInputId = localStream
            .getVideoTracks()[0]
            ?.getSettings().deviceId;

          currentAudioInput =
            audioInputs.find((audioInput) => {
              return audioInput.deviceId === currentAudioInputId;
            }) || currentAudioInput;

          currentVideoInput =
            videoInputs.find((videoInput) => {
              return videoInput.deviceId === currentVideoInputId;
            }) || currentVideoInput;
        }

        if (
          devicesState.currentAudioInput?.deviceId ===
            currentAudioInput?.deviceId &&
          devicesState.currentAudioOutput?.deviceId ===
            currentAudioOutput?.deviceId &&
          devicesState.currentVideoInput?.deviceId ===
            currentVideoInput?.deviceId
        ) {
          return;
        }

        setDevicesState({
          currentAudioInput: currentAudioInput,
          currentAudioOutput: currentAudioOutput,
          currentVideoInput: currentVideoInput,
          audioInputs: audioInputs,
          audioOutputs: audioOutputs,
          videoInputs: videoInputs,
          devices: devices,
        });
      };

      getDevices();
    }
  }, [peer, localStream, devicesState]);

  return (
    <DeviceContext.Provider value={{ ...devicesState, setCurrentActiveDevice }}>
      {children}
    </DeviceContext.Provider>
  );
}
