'use client';

import { createContext, useContext, useEffect, useState, useMemo } from 'react';

const defaultValue = {
  audioInputs: [] as MediaDeviceInfo[],
  audioOutputs: [] as MediaDeviceInfo[],
  videoInputs: [] as MediaDeviceInfo[],
};

const DeviceContext = createContext(defaultValue);

export const useDeviceContext = () => {
  return useContext(DeviceContext);
};

export function DeviceProvider({ children }: { children: React.ReactNode }) {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);

  useEffect(() => {
    const getDevices = async () => {
      const enumerateDevices = await navigator.mediaDevices.enumerateDevices();
      setDevices(enumerateDevices);
    };

    getDevices();
  }, []);

  const { audioInputs, audioOutputs, videoInputs } = useMemo(() => {
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

    return { audioInputs, audioOutputs, videoInputs };
  }, [devices]);

  return (
    <DeviceContext.Provider value={{ audioInputs, audioOutputs, videoInputs }}>
      {children}
    </DeviceContext.Provider>
  );
}
