'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { usePeerContext } from '@/_features/room/contexts/peer-context';

const defaultValue = {
  currentAudioInput: undefined as MediaDeviceInfo | undefined,
  currentAudioOutput: undefined as MediaDeviceInfo | undefined,
  currentVideoInput: undefined as MediaDeviceInfo | undefined,
  audioInputs: [] as MediaDeviceInfo[],
  audioOutputs: [] as MediaDeviceInfo[],
  videoInputs: [] as MediaDeviceInfo[],
};

const DeviceContext = createContext(defaultValue);

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

  useEffect(() => {
    if (peer) {
      const getDevices = async () => {
        const devices = await peer.getDevices(localStream);

        if (
          devicesState.currentAudioInput?.deviceId ===
            devices.currentAudioInput?.deviceId &&
          devicesState.currentAudioOutput?.deviceId ===
            devices.currentAudioOutput?.deviceId &&
          devicesState.currentVideoInput?.deviceId ===
            devices.currentVideoInput?.deviceId
        ) {
          return;
        }

        setDevicesState(devices);
      };

      getDevices();
    }
  }, [peer, localStream, devicesState]);

  return (
    <DeviceContext.Provider value={devicesState}>
      {children}
    </DeviceContext.Provider>
  );
}
