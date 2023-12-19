'use client';

import { Button, CircularProgress } from '@nextui-org/react';
import { useEffect, useState } from 'react';
import ConferenceActionsBar from '@/_features/room/components/conference-actions-bar';
import { useParticipantContext } from '@/_features/room/contexts/participant-context';
import { useMetadataContext } from '@/_features/room/contexts/metadata-context';
import { usePeerContext } from '@/_features/room/contexts/peer-context';
import MeetingOneOnOneLayout from './meeting-one-on-one-layout';
import MeetingGalleryLayout from './meeting-gallery-layout';
import MeetingPresentationLayout from './meeting-presentation-layout';
import WebinarSpeakerLayout from './conference-speaker-layout';
import WebinarPresentationLayout from './conference-presentation-layout';
import PlugConnectedFillIcon from '@/_shared/components/icons/plug-connected-fill-icon';
import PlugDisconnectedFillIcon from '@/_shared/components/icons/plug-disconnected-fill-icon';
import DebugModal from './debug-modal';

const WebinarRoomLayout = () => {
  const { streams } = useParticipantContext();
  const { currentLayout } = useMetadataContext();

  if (currentLayout === 'presentation') {
    return <WebinarPresentationLayout streams={streams} />;
  }

  return <WebinarSpeakerLayout streams={streams} />;
};

const MeetingRoomLayout = () => {
  const { streams } = useParticipantContext();
  const { currentLayout } = useMetadataContext();

  if (currentLayout === 'presentation') {
    return <MeetingPresentationLayout streams={streams} />;
  }

  if (streams.length === 2 && currentLayout === 'gallery') {
    return <MeetingOneOnOneLayout streams={streams} />;
  }

  return <MeetingGalleryLayout streams={streams} />;
};

export default function Conference({ roomType }: { roomType: string }) {
  return (
    <>
      <ConnectionStatusOverlay></ConnectionStatusOverlay>
      <DebugModal />
      <div className="viewport-height grid grid-rows-[1fr,80px] overflow-y-hidden">
        <div>
          {roomType === 'event' ? <WebinarRoomLayout /> : <MeetingRoomLayout />}
        </div>
        <div>
          <ConferenceActionsBar />
        </div>
      </div>
    </>
  );
}

function ConnectionStatusOverlay() {
  const { peer } = usePeerContext();
  const [connectionState, setConnectionState] = useState('connecting');

  useEffect(() => {
    if (!peer) return;

    const peerConnection = peer.getPeerConnection();

    if (!peerConnection) return;

    peerConnection.addEventListener('iceconnectionstatechange', () => {
      if (
        peerConnection.iceConnectionState === 'connected' ||
        peerConnection.iceConnectionState === 'completed'
      ) {
        setConnectionState('connected');
      } else if (peerConnection.iceConnectionState === 'failed') {
        setConnectionState('disconnected');
      } else {
        setConnectionState('connecting');
      }
    });
  }, [peer]);

  return (
    <div className="absolute left-4 top-4 z-40 p-2">
      <Button
        disabled
        isIconOnly
        className="h-8 w-8 min-w-0 rounded-lg p-1 shadow-sm"
      >
        {connectionState === 'connecting' && (
          <CircularProgress className="h-5 w-5 min-w-0" strokeWidth={8} />
        )}

        {connectionState === 'connected' && (
          <PlugConnectedFillIcon className="h-5 w-5" fill="#22C55E" />
        )}
        {connectionState === 'disconnected' && (
          <PlugDisconnectedFillIcon className="h-5 w-5" fill="#EF4444" />
        )}
      </Button>
    </div>
  );
}
