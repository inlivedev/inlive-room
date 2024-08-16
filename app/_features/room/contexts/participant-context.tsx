import { createContext, useContext, useEffect, useState } from 'react';
import { usePeerContext } from '@/_features/room/contexts/peer-context';
import { useClientContext } from '@/_features/room/contexts/client-context';
import { useMetadataContext } from '@/_features/room/contexts/metadata-context';
import { clientSDK, RoomEvent } from '@/_shared/utils/sdk';

export type ParticipantVideo = {
  readonly id: string;
  readonly clientId: string;
  readonly name: string;
  readonly origin: 'local' | 'remote';
  readonly source: 'media' | 'screen';
  readonly mediaStream: MediaStream;
  readonly videoElement: HTMLVideoElement;
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

export type ParticipantStream = Omit<ParticipantVideo, 'videoElement'>;

const topSpeakersLimit = 3;
const maxLastSpokeAt = 500000;

const createParticipantVideo = (stream: any): ParticipantVideo => {
  stream.videoElement = document.createElement('video');
  stream.videoElement.srcObject = stream.mediaStream;
  stream.pin = false;
  stream.spotlight = false;
  stream.fullscreen = false;
  return stream;
};

const defaultValue = {
  streams: [] as ParticipantVideo[],
};

const ParticipantContext = createContext(defaultValue);

export const useParticipantContext = () => {
  return useContext(ParticipantContext);
};

export function ParticipantProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { clientID, clientName } = useClientContext();
  const { peer } = usePeerContext();
  const { spotlights } = useMetadataContext();
  const [streams, setStreams] = useState<ParticipantVideo[]>([]);
  const [topSpeakers, setTopSpeakers] = useState<ParticipantVideo[]>([]);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

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
          return prevState.map((stream) => {
            if (stream.id === prevPinned?.id) stream.pin = false;
            if (stream.id === currentStream.id) stream.pin = true;
            return stream;
          });
        });
      } else {
        setStreams((prevState) => {
          return prevState.map((stream) => {
            if (stream.id === currentStream.id) stream.pin = false;
            return stream;
          });
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
          return prevState.map((stream) => {
            if (stream.id === currentStream.id) stream.fullscreen = true;
            return stream;
          });
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
          return prevState.map((stream) => {
            if (stream.id === currentStream.id) stream.fullscreen = false;
            return stream;
          });
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
          return prevState.map((stream) => {
            if (stream.fullscreen) stream.fullscreen = false;
            return stream;
          });
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
  }, [streams]);

  useEffect(() => {
    clientSDK.on(RoomEvent.STREAM_AVAILABLE, (data) => {
      const stream = createParticipantVideo(data.stream);
      data.stream.addEventListener('voiceactivity', (e: CustomEventInit) => {
        // reordering the streams based on voice activity
        stream.audioLevel = e.detail.audioLevel;
        stream.lastSpokeAt = Date.now();

        if (topSpeakers.length < topSpeakersLimit) {
          if (!topSpeakers.find((topSpeaker) => topSpeaker.id === stream.id)) {
            topSpeakers.push(stream);
            setTopSpeakers(topSpeakers);
            // call setStreams with the new streams order
            setStreams((prevState) => {
              return orderStreams(
                topSpeakers,
                checkSpotlight(prevState, spotlights)
              );
            });
          }
        } else {
          // find the stream with the lowest audio level and replace it with the new stream
          const lowestOldestAudioLevelStream = topSpeakers.reduce(
            (prev, current) => {
              const currentSinceSpoke = Date.now() - current.lastSpokeAt;
              if (maxLastSpokeAt < Date.now() - currentSinceSpoke) {
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
              setStreams((prevState) => {
                return orderStreams(
                  topSpeakers,
                  checkSpotlight(prevState, spotlights)
                );
              });
            }
          }
        }
      });

      setStreams((prevState) => {
        return checkSpotlight([...prevState, stream], spotlights);
      });
    });

    clientSDK.on(RoomEvent.STREAM_REMOVED, (data) => {
      setStreams((prevState) => {
        const newStreams = prevState.filter(
          (stream) => stream.id !== data.stream.id
        );
        return newStreams;
      });
    });
  }, [topSpeakers, spotlights]);

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

  return (
    <ParticipantContext.Provider value={{ streams: streams }}>
      {children}
    </ParticipantContext.Provider>
  );
}

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

	// local stream should always be on top
	if (streamA.origin === 'local') {
	  return -1;
	} else if (streamB.origin === 'local') {
	  return 1;
	}

    if (
      (!streamA.pin && streamB.pin) ||
      (!streamA.spotlight && streamB.spotlight) ||
      (streamAIsTopSpeaker && !streamBIsTopSpeaker)
    ) {
      return -1;
    } else if (
      (streamA.pin && !streamB.pin) ||
      (streamA.spotlight && !streamB.spotlight) ||
      (!streamAIsTopSpeaker && streamBIsTopSpeaker)
    ) {
      return 1;
    }

    return 0;
  });

  return [...streams];
};
