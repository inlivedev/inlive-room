import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';
import { usePeerContext } from '@/_features/room/contexts/peer-context';
import { hasTouchScreen } from '@/_shared/utils/has-touch-screen';

type DeviceContextStateType = {
  currentAudioInput: MediaDeviceInfo | undefined;
  currentAudioOutput: MediaDeviceInfo | undefined;
  currentVideoInput: MediaDeviceInfo | undefined;
  audioInputs: MediaDeviceInfo[];
  audioOutputs: MediaDeviceInfo[];
  videoInputs: MediaDeviceInfo[];
  devices: MediaDeviceInfo[];
  activeMic: boolean;
  activeCamera: boolean;
};

type DeviceContextType = DeviceContextStateType & {
  setCurrentDevice: (deviceInfo: MediaDeviceInfo) => void;
  setActiveMic: (active?: boolean) => void;
  setActiveCamera: (active?: boolean) => void;
};

const DeviceContext = createContext(undefined as unknown as DeviceContextType);

export const AudioOutputContext =
  typeof window !== 'undefined' ? new AudioContext() : null;

export const useDeviceContext = () => {
  return useContext(DeviceContext);
};

export function DeviceProvider({ children }: { children: React.ReactNode }) {
  const [devicesState, setDevicesState] = useState<DeviceContextStateType>({
    currentAudioInput: undefined,
    currentAudioOutput: undefined,
    currentVideoInput: undefined,
    audioInputs: [],
    audioOutputs: [],
    videoInputs: [],
    devices: [],
    activeMic: false,
    activeCamera: true,
  });

  const hasJoined = useRef<boolean>(false);
  const { peer } = usePeerContext();

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  const setCurrentDevice = (deviceInfo: MediaDeviceInfo) => {
    setDevicesState((prevState) => {
      const newData = { ...prevState };

      if (deviceInfo.kind === 'audioinput') {
        newData.currentAudioInput = deviceInfo;
      } else if (deviceInfo.kind === 'audiooutput') {
        newData.currentAudioOutput = deviceInfo;
      } else if (deviceInfo.kind === 'videoinput') {
        newData.currentVideoInput = deviceInfo;
      }

      return { ...newData };
    });
  };

  const setActiveCamera = (active = true) => {
    setDevicesState((prevState) => ({ ...prevState, activeCamera: active }));
  };

  const setActiveMic = (active = true) => {
    setDevicesState((prevState) => ({ ...prevState, activeMic: active }));
  };

  const getDevices = useCallback(
    async (localStream: MediaStream) => {
      const devices = await navigator.mediaDevices.enumerateDevices();

      const audioInputs: MediaDeviceInfo[] = [];
      const audioOutputs: MediaDeviceInfo[] = [];
      const videoInputs: MediaDeviceInfo[] = [];

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
          : audioInputs.length > 0
          ? audioInputs[0]
          : undefined;

      if (currentAudioInput) {
        window.sessionStorage.setItem(
          'device:selected-audio-input-id',
          currentAudioInput.deviceId
        );
      }

      let currentVideoInput: MediaDeviceInfo | undefined =
        devicesState.currentVideoInput
          ? devicesState.currentVideoInput
          : videoInputs.length > 0
          ? videoInputs[0]
          : undefined;

      if (currentVideoInput) {
        window.sessionStorage.setItem(
          'device:selected-video-input-id',
          currentVideoInput.deviceId
        );
      }

      const currentAudioOutput: MediaDeviceInfo | undefined =
        devicesState.currentAudioOutput
          ? devicesState.currentAudioOutput
          : audioOutputs.length > 0
          ? audioOutputs[0]
          : undefined;

      if (currentAudioOutput) {
        window.sessionStorage.setItem(
          'device:selected-audio-output-id',
          currentAudioOutput.deviceId
        );
      }

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
        devicesState.currentVideoInput?.deviceId === currentVideoInput?.deviceId
      ) {
        return;
      }

      setDevicesState((prevState) => ({
        ...prevState,
        currentAudioInput: currentAudioInput,
        currentAudioOutput: currentAudioOutput,
        currentVideoInput: currentVideoInput,
        audioInputs: audioInputs,
        audioOutputs: audioOutputs,
        videoInputs: videoInputs,
        devices: devices,
      }));
    },
    [devicesState]
  );

  useEffect(() => {
    if (peer && localStream) {
      if (devicesState.activeCamera) {
        peer.turnOnCamera();
        return;
      }

      peer.turnOffCamera();
      return;
    }
  }, [peer, localStream, devicesState.activeCamera]);

  useEffect(() => {
    if (peer && localStream) {
      if (devicesState.activeMic) {
        peer.turnOnMic();
        return;
      }

      peer.turnOffMic();
      return;
    }
  }, [peer, localStream, devicesState.activeMic]);

  useEffect(() => {
    const isTouchScreen = hasTouchScreen();
    const onWindowBlur = () => {
      if (isTouchScreen && peer && localStream) {
        setActiveCamera(false);
        setActiveMic(false);
      }
    };

    window.addEventListener('blur', onWindowBlur);
    return () => {
      window.removeEventListener('blur', onWindowBlur);
    };
  }, [peer, localStream]);

  useEffect(() => {
    const onMediaInputTurnedOn = ((event: CustomEvent) => {
      const detail = event.detail || {};
      const mediaInput = detail.mediaInput;

      if (mediaInput instanceof MediaStream) {
        setLocalStream(mediaInput);
      }
    }) as EventListener;

    document.addEventListener('turnon:media-input', onMediaInputTurnedOn);

    return () => {
      document.removeEventListener('turnon:media-input', onMediaInputTurnedOn);
    };
  }, []);

  useEffect(() => {
    if (localStream) {
      getDevices(localStream);
    }
  }, [localStream, getDevices]);

  useEffect(() => {
    if (!peer) return;
    if (hasJoined.current) return;

    if (localStream && !devicesState.activeMic) {
      peer.turnOffMic();
      hasJoined.current = true;
    }
  }, [peer, localStream, devicesState.activeMic]);

  return (
    <DeviceContext.Provider
      value={{
        ...devicesState,
        setCurrentDevice,
        setActiveMic,
        setActiveCamera,
      }}
    >
      {children}
    </DeviceContext.Provider>
  );
}
