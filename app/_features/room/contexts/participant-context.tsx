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
  readonly audioLevel: number;
  pin: boolean;
  spotlightForMyself: boolean;
  spotlightForEveryone: boolean;
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

const createParticipantVideo = (stream: any): ParticipantVideo => {
  stream.videoElement = document.createElement('video');
  stream.videoElement.srcObject = stream.mediaStream;
  stream.pin = false;
  stream.spotlightForMyself = false;
  stream.spotlightForEveryone = false;
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
  const { spotlightForEveryone } = useMetadataContext();
  const [streams, setStreams] = useState<ParticipantVideo[]>([]);
  const [pinnedStreams, setPinnedStreams] = useState<string[]>([]);
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
        setPinnedStreams((prevState) => {
          const pinned = [...prevState];
          const indexOf = pinned.indexOf(currentStream.id);

          if (indexOf > -1) {
            pinned.splice(indexOf, 1);
            pinned.push(currentStream.id);
          } else {
            pinned.push(currentStream.id);
          }

          return pinned;
        });

        setStreams((prevState) => {
          return prevState.map((stream) => {
            if (stream.id === currentStream.id) stream.pin = true;
            return stream;
          });
        });
      } else {
        setPinnedStreams((prevState) => {
          const pinned = [...prevState];
          const indexOf = pinned.indexOf(currentStream.id);
          if (indexOf > -1) pinned.splice(indexOf, 1);
          return pinned;
        });
        setStreams((prevState) => {
          return prevState.map((stream) => {
            if (stream.id === currentStream.id) stream.pin = false;
            return stream;
          });
        });
      }
    }) as EventListener;

    const onSpotlightForMyselfSet = ((event: CustomEventInit) => {
      const { id: streamID, active } = event.detail || {};
      const currentStream = streams.find((stream) => stream.id === streamID);
      if (!currentStream) return;

      if (active === true) {
        const prevSpotlight =
          streams[0]?.spotlightForMyself === true ? streams[0] : undefined;
        setStreams((prevState) => {
          return prevState.map((stream) => {
            if (stream.id === prevSpotlight?.id)
              stream.spotlightForMyself = false;
            if (stream.id === currentStream.id)
              stream.spotlightForMyself = true;
            return stream;
          });
        });
      } else {
        setStreams((prevState) => {
          return prevState.map((stream) => {
            if (stream.id === currentStream.id)
              stream.spotlightForMyself = false;
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
    document.addEventListener(
      'set:spotlight-for-myself',
      onSpotlightForMyselfSet
    );
    document.addEventListener('set:pin', onPinSet);
    document.addEventListener('set:fullscreen', onFullscreenSet);
    document.addEventListener('fullscreenchange', onFullScreenChange);
    document.addEventListener('webkitfullscreenchange', onFullScreenChange);

    return () => {
      document.removeEventListener('turnon:media-input', onMediaInputTurnedOn);
      document.removeEventListener(
        'set:spotlight-for-myself',
        onSpotlightForMyselfSet
      );
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
        const audioLevel = e.detail.audioLevel;

        // call setStreams with the new streams order
      });

      setStreams((prevState) => {
        return [...prevState, stream];
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
  }, []);

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

  // const newStreams = orderBySpotlight(
  //   checkSpotlight(streams, spotlightForEveryone)
  // );

  const newStreams = orderByPin(streams, pinnedStreams);

  return (
    <ParticipantContext.Provider value={{ streams: newStreams }}>
      {children}
    </ParticipantContext.Provider>
  );
}

const checkSpotlight = (
  streams: ParticipantVideo[],
  spotlightForEveryone: string[]
) => {
  return streams.map((stream) => {
    if (spotlightForEveryone.includes(stream.id)) {
      stream.spotlightForEveryone = true;
    } else {
      stream.spotlightForEveryone = false;
    }
    return stream;
  });
};

const orderByPin = (streams: ParticipantVideo[], pinnedStreams: string[]) => {
  return streams.sort((streamA, streamB) => {
    const indexA = pinnedStreams.indexOf(streamA.id);
    const indexB = pinnedStreams.indexOf(streamB.id);

    return (
      (indexA > -1 ? indexA : Infinity) - (indexB > -1 ? indexB : Infinity)
    );
  });
};

const orderBySpotlight = (streams: ParticipantVideo[]) => {
  return streams.sort((streamA, streamB) => {
    return (
      Number(streamB.spotlightForMyself) - Number(streamA.spotlightForMyself) ||
      Number(streamB.spotlightForEveryone) -
        Number(streamA.spotlightForEveryone)
    );
  });
};
