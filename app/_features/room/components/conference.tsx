'use client';

import { useEffect, useState, useRef, useCallback, CSSProperties } from 'react';
import ConferenceTopBar from '@/_features/room/components/conference-top-bar';
import ConferenceActionsBar from '@/_features/room/components/conference-actions-bar';
import { useMetadataContext } from '@/_features/room/contexts/metadata-context';
import { clientSDK, RoomEvent } from '@/_shared/utils/sdk';

import ConferenceNotification from './ conference-notification';
import ParticipantListSidebar from './participant-list-sidebar';
import RightSidebar from './right-sidebar';
import ChatSidebar from './chat-sidebar';
import ConferenceScreen from './conference-screen';
import '../styles/room.css';
import { usePeerContext } from '@/_features/room/contexts/peer-context';
import { useClientContext } from '@/_features/room/contexts/client-context';
import { hasTouchScreen } from '@/_shared/utils/has-touch-screen';

export type Sidebar = 'participants' | 'chat' | '';

function calculateVideoDimensions(
  screenWidth: number,
  screenHeight: number,
  totalVideos: number
) {
  let columns: number, rows: number;
  if (screenWidth > screenHeight) {
    columns = Math.ceil(Math.sqrt(totalVideos));
    rows = Math.ceil(totalVideos / columns);
  } else {
    rows = Math.ceil(Math.sqrt(totalVideos));
    columns = Math.ceil(totalVideos / rows);
  }

  return { columns, rows };
}

export type ParticipantVideo = {
  readonly id: string;
  readonly clientId: string;
  readonly name: string;
  readonly origin: 'local' | 'remote';
  readonly source: 'media' | 'screen';
  readonly mediaStream: MediaStream;
  audioLevel: number;
  lastSpokeAt: number;
  pin: boolean;
  fullscreen: boolean;
  readonly replaceTrack: (newTrack: MediaStreamTrack) => void;
  readonly addEventListener: (
    type: string,
    listener: (event: CustomEvent) => void
  ) => void;
  readonly removeEventListener: (
    type: string,
    listener: (event: CustomEvent) => void
  ) => void;
};

export const isMobile = () => {
  if (typeof window === 'undefined') return false;
  if (
    screen.orientation &&
    (screen.orientation.type === 'landscape-primary' ||
      screen.orientation.type === 'landscape-secondary')
  ) {
    return window.innerWidth < 768;
  } else {
    return window.innerWidth < 768;
  }
};

const isLandscape = () => {
  if (typeof window === 'undefined') return false;
  if (
    screen.orientation &&
    (screen.orientation.type === 'landscape-primary' ||
      screen.orientation.type === 'landscape-secondary')
  ) {
    return true;
  }

  return window.innerWidth > window.innerHeight;
};

const topSpeakersLimit = isMobile() ? 1 : 3;

const maxLastSpokeAt = 500000;

const createParticipantVideo = (stream: any): ParticipantVideo => {
  stream.pin = false;
  stream.spotlight = false;
  stream.fullscreen = false;
  return stream;
};

const isSpeaker = (
  stream: ParticipantVideo,
  topSpeakers: ParticipantVideo[]
) => {
  if (stream.source !== 'media') return false;

  const isTopSpeaker = topSpeakers.find(
    (topSpeaker) => topSpeaker.id === stream.id
  );

  if (isTopSpeaker) {
    if (Date.now() - stream.lastSpokeAt > maxLastSpokeAt) {
      return false;
    }

    return true;
  }

  return false;
};

const orderStreams = (
  topSpeakers: ParticipantVideo[],
  streams: ParticipantVideo[]
) => {
  streams.sort((streamA, streamB) => {
    const streamAIsTopSpeaker = topSpeakers.find(
      (topSpeaker) => topSpeaker.id === streamA.id
    );
    const streamBIsTopSpeaker = topSpeakers.find(
      (topSpeaker) => topSpeaker.id === streamB.id
    );

    if (streamA.fullscreen && !streamB.fullscreen) {
      return -1;
    } else if (!streamA.fullscreen && streamB.fullscreen) {
      return 1;
    }

    // screen always on top
    if (streamA.source === 'screen') return -1;
    if (streamB.source === 'screen') return 1;

    if (streamA.pin && !streamB.pin) {
      return -1;
    } else if (!streamA.pin && streamB.pin) {
      return 1;
    }

    if (
      streamA.origin === 'local' &&
      streamA.source === 'media' &&
      streamBIsTopSpeaker
    ) {
      return -1;
    } else if (
      streamB.origin === 'local' &&
      streamB.source === 'media' &&
      streamAIsTopSpeaker
    ) {
      return 1;
    }

    if (streamAIsTopSpeaker && !streamBIsTopSpeaker) {
      return -1;
    } else if (!streamAIsTopSpeaker && streamBIsTopSpeaker) {
      return 1;
    }

    return 0;
  });

  return streams;
};

export type DeviceStateType = {
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

export type DeviceType = DeviceStateType & {
  setCurrentDevice: (deviceInfo: MediaDeviceInfo) => void;
  setActiveMic: (active?: boolean) => void;
  setActiveCamera: (active?: boolean) => void;
};

export default function Conference() {
  const [style, setStyle] = useState<React.CSSProperties>({});
  const layoutContainerRef = useRef<HTMLDivElement>(null);
  const { currentLayout } = useMetadataContext();

  const [streams, setStreams] = useState<ParticipantVideo[]>([]);
  const [topSpeakers, setTopSpeakers] = useState<ParticipantVideo[]>([]);

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  const [activeLayout, setActiveLayout] = useState<string>(currentLayout);

  const { clientID, clientName } = useClientContext();
  const { peer } = usePeerContext();

  const [sidebar, setSidebar] = useState<Sidebar>('');

  const { pinnedStreams } = useMetadataContext();

  if (streams.length > 1) {
    orderStreams(topSpeakers, streams);
  }

  useEffect(() => {
    if (peer && localStream) {
      peer.addStream(localStream.id, {
        clientId: clientID,
        name: clientName,
        origin: 'local',
        source: 'media',
        mediaStream: localStream,
      });
    }
  }, [peer, localStream, clientID, clientName]);

  const [devicesState, setDevicesState] = useState<DeviceStateType>({
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

  const deviceTypes: DeviceType = {
    ...devicesState,
    setCurrentDevice,
    setActiveMic,
    setActiveCamera,
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

  useEffect(() => {
    const openRightSidebar = ((event: CustomEventInit) => {
      setSidebar(event.detail?.menu || '');
    }) as EventListener;

    const closeRightSidebar = (() => setSidebar('')) as EventListener;

    document.addEventListener('open:right-sidebar', openRightSidebar);
    document.addEventListener('close:right-sidebar', closeRightSidebar);

    return () => {
      document.removeEventListener('open:right-sidebar', openRightSidebar);
      document.removeEventListener('close:right-sidebar', closeRightSidebar);
    };
  }, []);

  const updateStreams = useCallback(() => {
    setStreams((prevStreams) => {
      return orderStreams(topSpeakers, prevStreams);
    });
  }, [topSpeakers]);

  const addStream = useCallback(
    (stream: ParticipantVideo) => {
      setStreams((prevStreams) => {
        const newStreams = [...prevStreams, stream];
        return orderStreams(topSpeakers, newStreams);
      });
    },
    [topSpeakers]
  );

  useEffect(() => {
    const onMediaInputTurnedOn = ((event: CustomEventInit) => {
      const detail = event.detail || {};
      const mediaInput = detail.mediaInput;

      if (mediaInput instanceof MediaStream) {
        setLocalStream(mediaInput);
      }
    }) as EventListener;

    const onPinSet = ((event: CustomEventInit) => {
      const { id: streamID, active } = event.detail || {};
      const currentStream = streams.find((stream) => stream.id === streamID);
      if (!currentStream) return;

      if (active === true) {
        const prevpinnedStreams =
          streams[0]?.pin === true ? streams[0] : undefined;
        setStreams((prevState) => {
          return orderStreams(
            topSpeakers,
            prevState.map((stream) => {
              if (stream.id === prevpinnedStreams?.id) stream.pin = false;
              if (stream.id === currentStream.id) stream.pin = true;
              return stream;
            })
          );
        });
      } else {
        setStreams((prevState) => {
          return orderStreams(
            topSpeakers,
            prevState.map((stream) => {
              if (stream.id === currentStream.id) stream.pin = false;
              return stream;
            })
          );
        });
      }
    }) as EventListener;

    const onFullscreenSet = (async (event: CustomEventInit) => {
      const { id: streamID, active } = event.detail || {};
      const currentStream = streams.find((stream) => stream.id === streamID);
      if (!currentStream) return;

      if (active === true && !currentStream.fullscreen) {
        const body = document.body;
        if (body.requestFullscreen) {
          await body.requestFullscreen();
        }
        // @ts-ignore
        else if (body.webkitEnterFullscreen) {
          // @ts-ignore
          await body.webkitEnterFullscreen();
        }

        setStreams((prevState) => {
          return orderStreams(
            topSpeakers,
            prevState.map((stream) => {
              if (stream.id === currentStream.id) stream.fullscreen = true;
              return stream;
            })
          );
        });
      } else if (active === false && currentStream.fullscreen) {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
        // @ts-ignore
        else if (document.webkitExitFullscreen) {
          // @ts-ignore
          await document.webkitExitFullscreen();
        }

        setStreams((prevState) => {
          return orderStreams(
            topSpeakers,
            prevState.map((stream) => {
              if (stream.id === currentStream.id) stream.fullscreen = false;
              return stream;
            })
          );
        });
      }
    }) as EventListener;

    const onFullScreenChange = () => {
      if (
        !document.fullscreenElement ||
        // @ts-ignore
        !document.webkitFullscreenElement
      ) {
        setStreams((prevState) => {
          return orderStreams(
            topSpeakers,
            prevState.map((stream) => {
              if (stream.fullscreen) stream.fullscreen = false;
              return stream;
            })
          );
        });
      }
    };

    document.addEventListener('turnon:media-input', onMediaInputTurnedOn);
    document.addEventListener('set:pin', onPinSet);
    document.addEventListener('set:fullscreen', onFullscreenSet);
    document.addEventListener('fullscreenchange', onFullScreenChange);
    document.addEventListener('webkitfullscreenchange', onFullScreenChange);

    return () => {
      document.removeEventListener('turnon:media-input', onMediaInputTurnedOn);
      document.removeEventListener('set:pin', onPinSet);
      document.removeEventListener('set:fullscreen', onFullscreenSet);
      document.removeEventListener('fullscreenchange', onFullScreenChange);
      document.removeEventListener(
        'webkitfullscreenchange',
        onFullScreenChange
      );
    };
  }, [streams, topSpeakers]);

  const [page, setPage] = useState(1);

  const getPageItems = useCallback(() => {
    const pageSize = isMobile() ? 9 : 25;
    const pageItems = streams.slice((page - 1) * pageSize, page * pageSize);
    return pageItems;
  }, [page, streams]);

  const maxVisibleParticipants = useCallback(() => {
    let max = 0;
    if (isMobile()) {
      switch (activeLayout) {
        case 'presentation':
          if (
            currentLayout === 'multispeakers' ||
            currentLayout === 'speaker'
          ) {
            max =
              pinnedStreams.length === 0 || pinnedStreams.length > 4
                ? 4
                : pinnedStreams.length + 1;
          } else {
            max = 4;
          }

          break;
        case 'speaker':
          max =
            pinnedStreams.length === 0 || pinnedStreams.length > 3
              ? 3
              : pinnedStreams.length;
          break;
        case 'multispeakers':
          max =
            pinnedStreams.length === 0 || pinnedStreams.length > 7
              ? 7
              : pinnedStreams.length;
          break;
        default:
          // gallery
          max = 9;
          break;
      }
    } else {
      switch (activeLayout) {
        case 'speaker':
          max =
            pinnedStreams.length === 0 || pinnedStreams.length > 3
              ? 3
              : pinnedStreams.length;
          break;
        case 'multispeakers':
          max =
            pinnedStreams.length === 0 || pinnedStreams.length > 7
              ? 7
              : pinnedStreams.length;
          break;
        case 'presentation':
          if (
            currentLayout === 'multispeakers' ||
            currentLayout === 'speaker'
          ) {
            max =
              pinnedStreams.length === 0 || pinnedStreams.length > 7
                ? 7
                : pinnedStreams.length + 1;
          } else {
            max = 7;
          }

          break;
        default:
          max = 25;
          break;
      }
    }
    if (activeLayout === 'gallery') {
      return getPageItems().length;
    }

    const maxVisible = streams.length > max ? max : streams.length;
    return maxVisible;
  }, [streams, activeLayout, currentLayout, pinnedStreams, getPageItems]);

  useEffect(() => {
    const removeStream = (stream: ParticipantVideo) => {
      setStreams((prevStreams) =>
        orderStreams(
          topSpeakers,
          prevStreams.filter((prevStream) => prevStream.id !== stream.id)
        )
      );
    };

    const onStreamAvailable = (data: any) => {
      if (data.stream.source === 'screen') {
        setActiveLayout('presentation');
      }

      const stream = createParticipantVideo(data.stream);
      data.stream.addEventListener('voiceactivity', (e: CustomEventInit) => {
        // reordering the streams based on voice activity
        stream.audioLevel = e.detail.audioLevel;
        stream.lastSpokeAt = Date.now();

        if (topSpeakers.length < topSpeakersLimit) {
          if (!topSpeakers.find((topSpeaker) => topSpeaker.id === stream.id)) {
            topSpeakers.push(stream);
            setTopSpeakers(topSpeakers);
            updateStreams();
          }
        } else if (topSpeakersLimit === 1) {
          // find the top speaker and replace it with the new streams
          const topSpeaker = topSpeakers[0];
          const currentSinceSpoke = Date.now() - topSpeaker.lastSpokeAt;
          if (
            maxLastSpokeAt < currentSinceSpoke ||
            stream.audioLevel > topSpeaker.audioLevel
          ) {
            topSpeakers[0] = stream;
            setTopSpeakers([...topSpeakers]);
            // call setStreams with the new streams order
            updateStreams();
          }
        } else {
          // find the stream with the lowest audio level and replace it with the new stream
          const lowestOldestAudioLevelStream = topSpeakers.reduce(
            (prev, current) => {
              const currentSinceSpoke = Date.now() - current.lastSpokeAt;
              if (maxLastSpokeAt < currentSinceSpoke) {
                const prevSinceSpoke = Date.now() - prev.lastSpokeAt;
                return currentSinceSpoke < prevSinceSpoke ? current : prev;
              }

              return current.audioLevel < prev.audioLevel ? current : prev;
            },
            topSpeakers[0]
          );

          if (
            maxLastSpokeAt <
              Date.now() - lowestOldestAudioLevelStream.lastSpokeAt ||
            stream.audioLevel > lowestOldestAudioLevelStream.audioLevel
          ) {
            let isChanged = false;
            const newTopSpeakers = topSpeakers.map((topSpeaker) => {
              if (topSpeaker.id === lowestOldestAudioLevelStream.id) {
                isChanged = true;
                return stream;
              }
              return topSpeaker;
            });

            if (isChanged) {
              setTopSpeakers(newTopSpeakers);
              // call setStreams with the new streams order
              updateStreams();
            }
          }
        }
      });

      addStream(stream);
    };

    clientSDK.on(RoomEvent.STREAM_AVAILABLE, onStreamAvailable);

    const onStreamRemoved = (data: any) => {
      if (data.stream.source === 'screen') {
        setActiveLayout(currentLayout);
      }

      removeStream(data.stream);
    };

    clientSDK.on(RoomEvent.STREAM_REMOVED, onStreamRemoved);

    return () => {
      clientSDK.removeEventListener(
        RoomEvent.STREAM_AVAILABLE,
        onStreamAvailable
      );
      clientSDK.removeEventListener(RoomEvent.STREAM_REMOVED, onStreamRemoved);
    };
  }, [addStream, topSpeakers, updateStreams, currentLayout]);

  const moreThanMax = streams.length > maxVisibleParticipants();

  const MAX_VISIBLE_PARTICIPANTS =
    moreThanMax &&
    activeLayout !== 'gallery' &&
    currentLayout !== 'speaker' &&
    currentLayout !== 'multispeakers'
      ? maxVisibleParticipants() - 1
      : maxVisibleParticipants();

  streams.forEach((stream) => {
    if (pinnedStreams.includes(stream.id)) {
      stream.pin = true;
    } else {
      stream.pin = false;
    }
  });

  const isOdd = streams.length % 2 !== 0;

  const columns = useRef(0);
  const rows = useRef(0);
  const needDoubleGrid = useRef(false);

  useEffect(() => {
    function layoutVideo() {
      if (!layoutContainerRef.current) return;
      let style;
      switch (activeLayout) {
        case 'presentation':
          if (
            layoutContainerRef.current.clientWidth >
            layoutContainerRef.current.clientHeight
          ) {
            // landscape
            let rows;
            if (
              currentLayout === 'speaker' ||
              currentLayout === 'multispeakers'
            ) {
              rows = MAX_VISIBLE_PARTICIPANTS - 1;
            } else {
              rows = moreThanMax
                ? MAX_VISIBLE_PARTICIPANTS
                : MAX_VISIBLE_PARTICIPANTS - 1;
            }
            style = {
              display: 'grid',
              gap: '1rem',
              gridTemplateColumns: `6fr 1fr`,
              gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
            };
          } else {
            // portrait
            let rows;
            if (
              currentLayout === 'speaker' ||
              currentLayout === 'multispeakers'
            ) {
              rows = MAX_VISIBLE_PARTICIPANTS;
            } else {
              rows = moreThanMax
                ? MAX_VISIBLE_PARTICIPANTS
                : MAX_VISIBLE_PARTICIPANTS - 1;
            }
            style = {
              display: 'grid',
              gap: '1rem',
              gridTemplateRows: `5fr 1fr`,
              gridTemplateColumns: `repeat(${rows}, minmax(0, 1fr))`,
            };
          }
          setStyle(style);
          break;
        case 'gallery':
        case 'multispeakers':
          const dimensions = calculateVideoDimensions(
            layoutContainerRef.current.clientWidth,
            layoutContainerRef.current.clientHeight,
            maxVisibleParticipants()
          );

          const items = activeLayout === 'gallery' ? getPageItems() : streams;

          if (activeLayout === 'gallery' && items.length > 2) {
            needDoubleGrid.current =
              (dimensions.columns * dimensions.rows - items.length) % 2 !== 0;
          } else if (
            activeLayout === 'multispeakers' &&
            maxVisibleParticipants() > 2
          ) {
            needDoubleGrid.current =
              (dimensions.columns * dimensions.rows -
                maxVisibleParticipants()) %
                2 !==
              0;
          }

          columns.current = dimensions.columns;
          rows.current = dimensions.rows;

          const columnsCount = needDoubleGrid.current
            ? dimensions.columns * 2
            : dimensions.columns;
          const rowsCount = needDoubleGrid.current
            ? dimensions.rows * 2
            : dimensions.rows;

          style = {
            gridTemplateColumns: `repeat(${columnsCount}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${rowsCount}, minmax(0, 1fr))`,
          };
          setStyle(style);
          break;
        case 'speaker':
          // landscape
          style = {
            display: 'flex',
            flexWrap: 'wrap' as CSSProperties['flexWrap'],
            gap: '1rem',
            justifyContent: 'center',
          };

          setStyle(style);
          break;
      }
    }

    if (streams.length > 0) layoutVideo();

    window.addEventListener('resize', layoutVideo);
    if (activeLayout !== 'presentation' && activeLayout !== currentLayout) {
      setActiveLayout(currentLayout);
    }

    return () => {
      window.removeEventListener('resize', layoutVideo);
    };
  }, [
    streams,
    maxVisibleParticipants,
    MAX_VISIBLE_PARTICIPANTS,
    currentLayout,
    pinnedStreams,
    topSpeakers,
    isOdd,
    moreThanMax,
    activeLayout,
    getPageItems,
  ]);

  let renderedCount = 0;
  const lastRowItemsCount =
    activeLayout === 'gallery'
      ? streams.length - (rows.current - 1) * columns.current
      : maxVisibleParticipants() - (rows.current - 1) * columns.current;

  const localpinnedStreams = streams.find(
    (stream) => stream.pin && stream.origin === 'local'
  );

  let lastRowStartIndex = 0;

  if (
    (activeLayout === 'gallery' &&
      columns.current * rows.current > streams.length) ||
    (activeLayout === 'multispeakers' &&
      columns.current * rows.current > maxVisibleParticipants())
  ) {
    if (needDoubleGrid.current) {
      const totalCols = columns.current * 2;
      const itemCols = 2;
      const emptyCols = totalCols - lastRowItemsCount * itemCols;
      lastRowStartIndex = Math.floor(emptyCols / 2) + 1;
    } else {
      const emptyCols = columns.current - lastRowItemsCount;
      lastRowStartIndex = Math.floor(emptyCols / 2) + 1;
    }
  }

  return (
    <div className="viewport-height grid grid-cols-[1fr,auto]">
      <div className="relative grid h-full grid-rows-[auto,1fr,72px] overflow-y-hidden">
        <ConferenceTopBar
          streams={streams}
          sidebar={sidebar}
          activeLayout={activeLayout}
          pageSize={isMobile() ? 9 : 25}
          page={page}
          setPage={setPage}
        />
        <div className="px-4">
          <div className="relative grid h-full w-full grid-cols-[auto,minmax(auto,max-content)]">
            <div className="relative grid grid-rows-[auto,1fr]">
              {localpinnedStreams ? (
                <div className="z-20 mb-3">
                  <ConferenceNotification
                    show={true}
                    text="You are currently being pinnedStreams. Your video is highlighted for everyone."
                  />
                </div>
              ) : null}
              <div
                ref={layoutContainerRef}
                className={
                  currentLayout +
                  '-layout participant-container absolute h-full w-full'
                }
                style={style}
              >
                {(activeLayout === 'gallery' ? getPageItems() : streams).map(
                  (stream) => {
                    let hidden = false;
                    renderedCount++;
                    if (renderedCount > MAX_VISIBLE_PARTICIPANTS) {
                      hidden = true;
                    }

                    let itemStyle = {};

                    if (
                      !hidden &&
                      layoutContainerRef.current &&
                      stream.source === 'screen'
                    ) {
                      // presentation layout
                      let rows;
                      if (
                        currentLayout === 'speaker' ||
                        currentLayout === 'multispeakers'
                      ) {
                        rows = MAX_VISIBLE_PARTICIPANTS - 1;
                      } else {
                        rows = moreThanMax
                          ? MAX_VISIBLE_PARTICIPANTS
                          : MAX_VISIBLE_PARTICIPANTS - 1;
                      }

                      if (
                        layoutContainerRef.current.clientWidth >
                        layoutContainerRef.current.clientHeight
                      ) {
                        // landscape

                        itemStyle = {
                          display: 'grid',
                          gridRowEnd: 'span ' + rows,
                        };
                      } else {
                        // portrait
                        itemStyle = {
                          gridColumnEnd: 'span ' + rows,
                        };
                      }
                    } else if (
                      (activeLayout === 'gallery' ||
                        activeLayout === 'multispeakers') &&
                      stream.source !== 'screen' &&
                      needDoubleGrid.current
                    ) {
                      itemStyle = {
                        display: 'grid',
                        gridRowEnd: 'span 2',
                        gridColumnEnd: 'span 2',
                      };
                    } else if (
                      !hidden &&
                      layoutContainerRef.current &&
                      activeLayout === 'speaker'
                    ) {
                      if (renderedCount === 1) {
                        itemStyle = {
                          flexBasis: '100%',
                          height: '75%',
                        };
                      } else if (!isMobile()) {
                        itemStyle = {
                          width: '20%',
                          height: '20%',
                        };
                      }
                    }

                    const currentRow = Math.ceil(
                      renderedCount / columns.current
                    );

                    if (
                      activeLayout === 'gallery' &&
                      rows.current * columns.current !==
                        getPageItems().length &&
                      currentRow === rows.current
                    ) {
                      // last row
                      // @ts-ignore
                      itemStyle.gridColumnStart = lastRowStartIndex;
                      lastRowStartIndex += needDoubleGrid.current ? 2 : 1;
                    } else if (
                      activeLayout === 'multispeakers' &&
                      rows.current * columns.current !==
                        maxVisibleParticipants() &&
                      currentRow === rows.current
                    ) {
                      // last row
                      // @ts-ignore
                      itemStyle.gridColumnStart = lastRowStartIndex;
                      lastRowStartIndex += needDoubleGrid.current ? 2 : 1;
                    }

                    return (
                      <div
                        className={
                          (hidden
                            ? 'participant-item-hidden'
                            : 'participant-item') +
                          (stream.pin ? ' pinnedStreams' : '') +
                          (stream.source === 'screen' ? ' screen' : ' media')
                        }
                        key={`stream-${stream.id}`}
                        style={itemStyle}
                      >
                        <ConferenceScreen
                          key={'conference-screen-' + stream.id}
                          stream={stream}
                          pinned={stream.pin}
                          currentAudioOutput={devicesState.currentAudioOutput}
                        />
                      </div>
                    );
                  }
                )}
                {moreThanMax &&
                  currentLayout !== 'gallery' &&
                  currentLayout !== 'speaker' &&
                  currentLayout !== 'multispeakers' && (
                    <div className="participant-item">
                      <div className="absolute flex h-full w-full items-center justify-center rounded-lg bg-zinc-800 p-2 text-xs font-medium shadow-lg sm:text-sm">
                        More <span className="hidden sm:inline">+</span>
                      </div>
                    </div>
                  )}
              </div>
            </div>
            {sidebar ? (
              <div className="ml-4 w-[360px]">
                <RightSidebar isOpen={!!sidebar}>
                  {sidebar === 'participants' ? (
                    <ParticipantListSidebar streams={streams} />
                  ) : null}
                  {sidebar === 'chat' ? <ChatSidebar /> : null}
                </RightSidebar>
              </div>
            ) : null}
          </div>
        </div>
        <ConferenceActionsBar
          streams={streams}
          sidebar={sidebar}
          deviceTypes={deviceTypes}
        />
      </div>
    </div>
  );
}
