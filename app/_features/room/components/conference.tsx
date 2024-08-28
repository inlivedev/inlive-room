'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
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
import { on } from 'events';

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
  spotlight: boolean;
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

const isMobile = () => {
  if (
    screen.orientation.type === 'landscape-primary' ||
    screen.orientation.type === 'landscape-secondary'
  ) {
    return window.innerWidth < 768;
  } else {
    return window.innerWidth < 768;
  }
};

const topSpeakersLimit = isMobile() ? 1 : 3;
const maxLastSpokeAt = 500000;

const createParticipantVideo = (stream: any): ParticipantVideo => {
  stream.pin = false;
  stream.spotlight = false;
  stream.fullscreen = false;
  return stream;
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

const checkSpotlight = (streams: ParticipantVideo[], spotlights: string[]) => {
  return streams.map((stream) => {
    if (spotlights.includes(stream.id)) {
      stream.spotlight = true;
    } else {
      stream.spotlight = false;
    }
    return stream;
  });
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

  const { spotlights } = useMetadataContext();
  const [streams, setStreams] = useState<ParticipantVideo[]>([]);
  const [topSpeakers, setTopSpeakers] = useState<ParticipantVideo[]>([]);

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  const { clientID, clientName } = useClientContext();
  const { peer } = usePeerContext();

  const [sidebar, setSidebar] = useState<Sidebar>('');

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

  const updateStreams =  useCallback(() => {
    setStreams((prevStreams) => {
      return orderStreams(topSpeakers, checkSpotlight(prevStreams, spotlights));
    });
  }, [topSpeakers, spotlights]);

  const addStream = (stream: ParticipantVideo) => {
    setStreams((prevStreams) => {
      const newStreams = [...prevStreams,stream];
      return orderStreams(topSpeakers, checkSpotlight(newStreams, spotlights));
    });
  };

  const removeStream = (stream: ParticipantVideo) => {
    setStreams((prevStreams) =>
      prevStreams.filter((prevStream) => prevStream.id !== stream.id)
    );
  };

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
        const prevPinned = streams[0]?.pin === true ? streams[0] : undefined;
        setStreams((prevState) => {
          return orderStreams(
            topSpeakers,
            prevState.map((stream) => {
              if (stream.id === prevPinned?.id) stream.pin = false;
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

  let hasPinned = false;
  let localPinned = false;
  let totalPinned = 0;

  streams.forEach((stream) => {
    if (stream.pin) {
      hasPinned = true;
      totalPinned++;
      if (stream.origin === 'local') {
        localPinned = true;
      }
    }
  });

  const maxVisibleParticipants = () => {
    let max = 0;
    if (isMobile()) {
		switch (currentLayout) {
			case 'presentation':
				max = 4;
				break;
			case 'gallery':
				max = 9;
				break;
			default:
				max = 9;
				break;

		}
    } else {
		switch (currentLayout) {
			case 'presentation':
				max = 7;
				break;
			case 'gallery':
				max = 49;
				break;
			default:
				max = 49;
				break;
		}
    }
    return streams.length > max ? max : streams.length;
  };

  useEffect(() => {
	const onStreamAvailable = (data:any) => {
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
		  if (maxLastSpokeAt < currentSinceSpoke || stream.audioLevel > topSpeaker.audioLevel) {
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
          )

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
    }

    clientSDK.on(RoomEvent.STREAM_AVAILABLE, onStreamAvailable);

	const onStreamRemoved = (data:any) => {
		removeStream(data.stream);
	  }

    clientSDK.on(RoomEvent.STREAM_REMOVED, onStreamRemoved);

	return () => {
	  clientSDK.removeEventListener(RoomEvent.STREAM_AVAILABLE, onStreamAvailable);
	  clientSDK.removeEventListener(RoomEvent.STREAM_REMOVED, onStreamRemoved);
	}
  }, []);

  const moreThanMax = streams.length > maxVisibleParticipants();

  const MAX_VISIBLE_PARTICIPANTS = moreThanMax
    ? maxVisibleParticipants() - 1
    : maxVisibleParticipants();

  useEffect(() => {
    function layoutVideo() {
      if (!layoutContainerRef.current) return;
      if (currentLayout === 'presentation') {
        let style;
        if (
          layoutContainerRef.current.clientWidth >
          layoutContainerRef.current.clientHeight
        ) {
          // landscape
          style = {
            display: 'grid',
            gap: '1rem',
            gridTemplateColumns: `6fr 1fr`,
            gridTemplateRows: `repeat(${MAX_VISIBLE_PARTICIPANTS}, minmax(0, 1fr))`,
          };
        } else {
          // portrait
          style = {
            display: 'grid',
            gap: '1rem',
            gridTemplateRows: `5fr 1fr`,
            gridTemplateColumns: `repeat(${MAX_VISIBLE_PARTICIPANTS}, minmax(0, 1fr))`,
          };
        }
        setStyle(style);
      } else {
        const dimensions = calculateVideoDimensions(
          layoutContainerRef.current.clientWidth,
          layoutContainerRef.current.clientHeight,
          maxVisibleParticipants()
        );
        const style = {
          gridTemplateColumns: `repeat(${dimensions.columns}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${dimensions.rows}, minmax(0, 1fr))`,
        };
        setStyle(style);
      }
    }

    if (streams.length > 0) layoutVideo();

    window.addEventListener('resize', layoutVideo);

    return () => {
      window.removeEventListener('resize', layoutVideo);
    };
  }, [streams]);

  //   const maxColumn = isMobile() ? 2 : Math.ceil(Math.sqrt(streams.length)) + 2;

  let renderedCount = 0;

  return (
    <div className="viewport-height grid grid-cols-[1fr,auto]">
      <div className="relative grid h-full grid-rows-[auto,1fr,72px] overflow-y-hidden">
        <ConferenceTopBar streams={streams} sidebar={sidebar} />
        <div className="px-4">
          <div className="relative grid h-full w-full grid-cols-[auto,minmax(auto,max-content)]">
            <div className="grid grid-rows-[auto,1fr]">
              {localPinned ? (
                <div className="mb-3">
                  <ConferenceNotification
                    show={true}
                    text="You are currently being pinned. Your video is highlighted for everyone."
                  />
                </div>
              ) : null}
              <div
                ref={layoutContainerRef}
                className={
                  currentLayout !== 'presentation' && hasPinned
                    ? 'pinned'
                    : currentLayout +
                      '-layout participant-container absolute h-full w-full'
                }
                style={style}
              >
                {streams.map((stream, id) => {
                  let hidden = false;
                  renderedCount++;
                  if (renderedCount > MAX_VISIBLE_PARTICIPANTS) {
                    hidden = true;
                  }

                  let style;

                  if (
                    !hidden &&
                    layoutContainerRef.current &&
                    (stream.source === 'screen')) {
                    if (
                      layoutContainerRef.current.clientWidth >
                      layoutContainerRef.current.clientHeight
                    ) {
                      // landscape
                      style = {
                        display: 'grid',
                        gridRowEnd: 'span ' + MAX_VISIBLE_PARTICIPANTS,
                      };
                    } else {
                      // portrait
                      style = {
                        display: 'grid',
                        gridColumnEnd: 'span ' + MAX_VISIBLE_PARTICIPANTS,
                      };
                    }
                  }

                  return (
                    <div
                      className={
                        (hidden
                          ? 'participant-item-hidden'
                          : 'participant-item') +
                        (stream.spotlight ? ' spotlight' : '') +
                        (stream.pin ? ' pinned' : '') +
                        (stream.source === 'screen' ? ' screen' : ' media')
                      }
                      key={`stream-${stream.id}`}
                      style={style}
                    >
                      <ConferenceScreen
                        key={'conference-screen-' + stream.id}
                        stream={stream}
                        currentAudioOutput={devicesState.currentAudioOutput}
                      />
                    </div>
                  );
                })}
                {moreThanMax && (
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
