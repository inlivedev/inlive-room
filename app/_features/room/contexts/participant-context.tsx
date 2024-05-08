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
  stream.pin = false;
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
  const { spotlights } = useMetadataContext();
  const [streams, setStreams] = useState<ParticipantVideo[]>([]);
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

    document.addEventListener('turnon:media-input', onMediaInputTurnedOn);
    document.addEventListener('set:pin', onPinSet);

    return () => {
      document.removeEventListener('turnon:media-input', onMediaInputTurnedOn);
      document.removeEventListener('set:pin', onPinSet);
    };
  }, [streams]);

  useEffect(() => {
    setStreams((prevState) => {
      return prevState.map((stream) => {
        if (spotlights.includes(stream.id)) {
          stream.spotlight = true;
        } else {
          stream.spotlight = false;
        }
        return stream;
      });
    });
  }, [spotlights]);

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

  const newStreams = orderByPinned(checkSpotlight(streams, spotlights));

  return (
    <ParticipantContext.Provider value={{ streams: newStreams }}>
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

const orderByPinned = (streams: ParticipantVideo[]) => {
  return streams.sort((streamA, streamB) => {
    return (
      Number(streamB.spotlight) - Number(streamA.spotlight) ||
      Number(streamB.pin) - Number(streamA.pin)
    );
  });
};
