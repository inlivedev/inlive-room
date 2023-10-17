'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import ConferenceScreen from '@/_features/room/components/conference-screen';
import type { InstanceStream } from '@/_shared/sdk/room/stream/stream-types';
import { useParticipantContext } from '@/_features/room/contexts/participant-context';
import styles from '@/_features/room/styles/conference.module.css';
import { Button, CircularProgress } from '@nextui-org/react';
import { usePeerContext } from '../contexts/peer-context';
import PlugConnectedFillIcon from '@/_shared/components/icons/plug-connected-fill-icon';
import PlugDisconnectedFillIcon from '@/_shared/components/icons/plug-disconnected-fill-icon';

const isMobile = () => {
  if (typeof window !== 'undefined') {
    return window.innerWidth <= 600;
  }
};

export default function ConferenceParticipants() {
  const { streams } = useParticipantContext();
  const { peer } = usePeerContext();
  const [connectionState, setConnectionState] = useState('connecting');

  useEffect(() => {
    const peerConnection = peer?.getPeerConnection();

    if (!peerConnection) return;

    peerConnection.addEventListener('iceconnectionstatechange', () => {
      if (peerConnection.iceConnectionState !== 'failed' || 'connected') {
        setConnectionState('connecting');
      }

      if (peerConnection.iceConnectionState === 'failed') {
        setConnectionState('disconnected');
      }
      if (peerConnection.iceConnectionState === 'connected') {
        setConnectionState('connected');
      }
    });
  });

  const screenCount = useRef<number>(0);

  const { medias, screens } = useMemo(() => {
    const medias: InstanceStream[] = [];
    const screens: InstanceStream[] = [];

    for (const stream of streams) {
      if (stream.source === 'screen') {
        screens.push(stream);
      } else {
        medias.push(stream);
      }
    }

    return { medias, screens };
  }, [streams]);

  const hasScreen = useMemo(() => {
    return screens.length > 0;
  }, [screens]);

  const layout = (streams: InstanceStream[]) => {
    if (hasScreen) {
      return isMobile()
        ? {
            gridTemplateColumns: `repeat(${streams.length - 1}, 1fr)`,
          }
        : {
            gridTemplateRows: `repeat(${streams.length - 1}, 1fr)`,
          };
    }
  };

  const videoLayout = (hasScreen: boolean, source: string) => {
    if (hasScreen) {
      if (source === 'screen') {
        screenCount.current++;

        if (screenCount.current === 1) {
          return isMobile()
            ? {
                gridColumn: `1/span ${streams.length - 1}`,
              }
            : {
                gridRow: `1/span ${streams.length - 1}`,
              };
        }

        return {
          gridRow: `1/auto`,
          gridColumn: `1/auto`,
          minHeight: 0,
          height: '100%',
        };
      }
    }

    return {};
  };

  const renderVideo = (stream: InstanceStream) => {
    const className = hasScreen
      ? stream.source === 'screen' && screenCount.current === 0
        ? styles['presenting-screen']
        : styles['presenting-media']
      : styles['gallery-media'];

    const isLocal = stream.origin === 'local';
    const isUserCameraScreen =
      stream.origin === 'local' && stream.source === 'media';

    return (
      <div
        key={stream.id}
        className={`${className} ${
          isLocal ? styles['local'] : styles['remote']
        } ${isUserCameraScreen ? styles['user-camera-screen'] : ''}`}
        style={videoLayout(hasScreen, stream.source)}
      >
        <ConferenceScreen stream={stream} />
      </div>
    );
  };

  function ConnectionStatusOverlay() {
    return (
      <div
        className="p-2.5"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 9999, // Adjust the z-index value as needed
        }}
      >
        <Button isIconOnly style={{ padding: '0.5rem', fontSize: '0.75rem' }}>
          {connectionState === 'connecting' && (
            <CircularProgress size="sm" strokeWidth={8} />
          )}

          {connectionState === 'connected' && (
            <PlugConnectedFillIcon fill="#22C55E" />
          )}
          {connectionState === 'disconnected' && (
            <PlugDisconnectedFillIcon fill="#EF4444" />
          )}
        </Button>
      </div>
    );
  }

  return (
    <div
      className={`${styles[hasScreen ? 'presenting' : 'gallery']} w-full ${
        styles['media']
      }`}
      style={layout(screens)}
    >
      <ConnectionStatusOverlay></ConnectionStatusOverlay>
      {screens
        ? screens.map((stream) => {
            screenCount.current = 0;
            return renderVideo(stream);
          })
        : null}
      {medias ? medias.map(renderVideo) : null}
    </div>
  );
}
