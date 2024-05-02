import { createContext, useContext, useEffect, useState } from 'react';
import { usePeerContext } from '@/_features/room/contexts/peer-context';
import { useClientContext } from '@/_features/room/contexts/client-context';
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
  pinned: boolean;
  spotlight: boolean;
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
  stream.pinned = false;
  stream.spotlight = false;
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

    const onActiveLocalSpotlight = ((event: CustomEventInit) => {
      const detail = event.detail || {};
      const streamID = detail.id;
      const active = detail.active;

      const currentStream = streams.find((stream) => stream.id === streamID);
      if (!currentStream) return;

      if (active === true) {
        const currentSpotlight = streams.find(
          (stream) => stream.spotlight === true
        );

        setStreams((prevState) => {
          return prevState.map((stream) => {
            if (stream.id === currentSpotlight?.id) {
              stream.spotlight = false;
            }
            if (stream.id === currentStream.id) {
              stream.spotlight = true;
            }
            return stream;
          });
        });
      } else if (active === false) {
        setStreams((prevState) => {
          return prevState.map((stream) => {
            if (stream.id === currentStream.id) {
              stream.spotlight = false;
            }
            return stream;
          });
        });
      }
    }) as EventListener;

    const onActiveLocalPinned = ((event: CustomEventInit) => {
      const detail = event.detail || {};
      const streamID = detail.id;
      const active = detail.active;

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
            if (stream.id === currentStream.id) {
              stream.pinned = true;
            }
            return stream;
          });
        });
      } else if (active === false) {
        setPinnedStreams((prevState) => {
          const pinned = [...prevState];
          const indexOf = pinned.indexOf(currentStream.id);

          if (indexOf > -1) {
            pinned.splice(indexOf, 1);
          }

          return pinned;
        });

        setStreams((prevState) => {
          return prevState.map((stream) => {
            if (stream.id === currentStream.id) {
              stream.pinned = false;
            }
            return stream;
          });
        });
      }
    }) as EventListener;

    document.addEventListener('turnon:media-input', onMediaInputTurnedOn);
    document.addEventListener('active:local-spotlight', onActiveLocalSpotlight);
    document.addEventListener('active:local-pinned', onActiveLocalPinned);

    return () => {
      document.removeEventListener('turnon:media-input', onMediaInputTurnedOn);
      document.removeEventListener(
        'active:local-spotlight',
        onActiveLocalSpotlight
      );
      document.removeEventListener('active:local-pinned', onActiveLocalPinned);
    };
  }, [streams]);

  useEffect(() => {
    clientSDK.on(RoomEvent.STREAM_AVAILABLE, (data) => {
      const video = createParticipantVideo(data.stream);
      data.stream.addEventListener('voiceactivity', (e: CustomEventInit) => {
        // reordering the streams based on voice activity
        const audioLevel = e.detail.audioLevel;

        // call setStreams with the new streams order
      });

      setStreams((prevState) => {
        return [...prevState, video];
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

  const newStreams = orderBySpotlight(orderByPinned(streams, pinnedStreams));

  return (
    <ParticipantContext.Provider value={{ streams: newStreams }}>
      {children}
    </ParticipantContext.Provider>
  );
}

const orderByPinned = (
  streams: ParticipantVideo[],
  pinnedStreams: string[]
) => {
  return streams.slice().sort((streamA, streamB) => {
    const indexA = pinnedStreams.indexOf(streamA.id);
    const indexB = pinnedStreams.indexOf(streamB.id);

    return (
      (indexA > -1 ? indexA : Infinity) - (indexB > -1 ? indexB : Infinity)
    );
  });
};

const orderBySpotlight = (streams: ParticipantVideo[]) => {
  return streams.slice().sort((streamA, streamB) => {
    return Number(streamB.spotlight) - Number(streamA.spotlight);
  });
};
