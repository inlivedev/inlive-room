import { Button, CircularProgress } from '@nextui-org/react';
import { useEffect, useState } from 'react';
import ConferenceActionsBar from '@/_features/room/components/conference-actions-bar';
import { useParticipantContext } from '@/_features/room/contexts/participant-context';
import { usePeerContext } from '../contexts/peer-context';
import ConferenceSpeakerLayout from './conference-speaker-layout';
import ConferencePresentationLayout from './conference-presentation-layout';
import { useMetadataContext } from '@/_features/room/contexts/metadata-context';
import PlugConnectedFillIcon from '@/_shared/components/icons/plug-connected-fill-icon';
import PlugDisconnectedFillIcon from '@/_shared/components/icons/plug-disconnected-fill-icon';

export default function Conference({ isModerator }: { isModerator: boolean }) {
  const { streams } = useParticipantContext();
  const { layout } = useMetadataContext();

  return (
    <>
      <ConnectionStatusOverlay></ConnectionStatusOverlay>
      <div className="viewport-height grid grid-rows-[1fr,80px] overflow-y-hidden">
        <div>
          {layout === 'speaker' ? (
            <ConferenceSpeakerLayout
              isModerator={isModerator}
              streams={streams}
            />
          ) : layout === 'presentation' ? (
            <ConferencePresentationLayout
              isModerator={isModerator}
              streams={streams}
            />
          ) : null}
        </div>
        <div>
          <ConferenceActionsBar isModerator={isModerator} />
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
