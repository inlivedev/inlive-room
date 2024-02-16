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
  readonly VideoElement: HTMLVideoElement;
  readonly replaceTrack: (newTrack: MediaStreamTrack) => void;
};

export type ParticipantStream = {
  readonly id: string;
  readonly clientId: string;
  readonly name: string;
  readonly origin: 'local' | 'remote';
  readonly source: 'media' | 'screen';
  readonly mediaStream: MediaStream;
  readonly replaceTrack: (newTrack: MediaStreamTrack) => void;
};

const createParticipantVideo = (
  stream: ParticipantStream
): ParticipantVideo => {
  const participantVideo: ParticipantVideo = {
    ...stream,
    VideoElement: document.createElement('video'),
  };

  participantVideo.VideoElement.srcObject = stream.mediaStream;

  return participantVideo;
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
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

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
    if (peer && localStream) {
      clientSDK.on(RoomEvent.STREAM_AVAILABLE, (data) => {
        streams.push(createParticipantVideo(data.stream));
        setStreams([...streams]);
        console.log('stream added, streams count: ', streams.length);
      });

      clientSDK.on(RoomEvent.STREAM_REMOVED, (data) => {
        const index = streams.findIndex(
          (stream) => stream.id === data.stream.id
        );
        if (index !== -1) {
          streams.splice(index, 1);
        }
        setStreams([...streams]);
        console.log('stream removed, streams count: ', streams.length);
      });

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
    <ParticipantContext.Provider value={{ streams }}>
      {children}
    </ParticipantContext.Provider>
  );
}
