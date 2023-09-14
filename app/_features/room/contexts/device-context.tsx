'use client';

import { createContext, useContext, useMemo } from 'react';
import { useEnumerateDevices } from '@/_features/room/hooks/use-enumerate-devices';

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
  const devices = useEnumerateDevices();

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
