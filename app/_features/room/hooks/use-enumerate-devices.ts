import { useState, useEffect } from 'react';

export const useEnumerateDevices = () => {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);

  useEffect(() => {
    const getDevices = async () => {
      const enumerateDevices = await navigator.mediaDevices.enumerateDevices();
      setDevices(enumerateDevices);
    };

    getDevices();
  }, []);

  return devices;
};
