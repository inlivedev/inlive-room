'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import type { ClientType } from '@/_shared/types/client';
import {
  ChannelClosureReasons,
  RoomEvent,
  clientSDK,
} from '@/_shared/utils/sdk';

type Peer = Awaited<ReturnType<typeof clientSDK.createPeer>>;

type ConnectionState = 'connecting' | 'connected' | 'disconnected';

const PeerContext = createContext({
  peer: null as Peer | null,
  debug: false,
  connectionState: '' as ConnectionState,
  roomID: '',
});

export const usePeerContext = () => {
  return useContext(PeerContext);
};

type PeerProviderProps = {
  children: React.ReactNode;
  roomID: string;
  client: ClientType.ClientData;
  debug: boolean;
};

export function PeerProvider({
  children,
  roomID,
  client,
  debug = false,
}: PeerProviderProps) {
  const [peer, setPeer] = useState<Peer | null>(null);
  const [connectionState, setConnectionState] =
    useState<ConnectionState>('connecting');

  useEffect(() => {
    if (!peer) {
      const createPeer = async () => {
        const peer = await clientSDK.createPeer(roomID, client.clientID);
        setPeer(peer);
      };

      createPeer();
    }

    return () => {
      if (peer) {
        peer.disconnect();
        setPeer(null);
      }
    };
  }, [roomID, client, peer]);

  useEffect(() => {
    const peerConnection = peer?.getPeerConnection();

    if (!peerConnection) return;

    const onConnectionStateChange = () => {
      const { connectionState } = peerConnection;
      if (connectionState === 'connected') {
        setConnectionState('connected');
      } else if (connectionState === 'failed' || connectionState === 'closed') {
        setConnectionState('disconnected');
      } else {
        setConnectionState('connecting');
      }
    };

    peerConnection.addEventListener(
      'connectionstatechange',
      onConnectionStateChange
    );

    return () => {
      peerConnection?.removeEventListener(
        'connectionstatechange',
        onConnectionStateChange
      );
    };
  }, [peer]);

  useEffect(() => {
    if (!peer) return;

    clientSDK.on(RoomEvent.CHANNEL_CLOSED, ({ reason }: { reason: string }) => {
      if (reason === ChannelClosureReasons.NOT_FOUND) {
        peer?.disconnect();
        setConnectionState('disconnected');
      }
    });
  }, [peer]);

  // use effect for sending the webrtc stats
  useEffect(() => {
    const peerConnection = peer?.getPeerConnection();
    if (!peer || !peerConnection) return;

    const sendWebrtcStats = async () => {
      try {
        const stats = await peerConnection.getStats();

        type RTCStatsType = {
          videoRtcOutbound: RTCOutboundRtpStreamStats | undefined;
          audioRtcOutbound: RTCOutboundRtpStreamStats | undefined;
          rtcCandidatePair: RTCIceCandidatePairStats | undefined;
          videoRtcRemoteInbound: Record<string, any> | undefined;
          audioRtcRemoteInbound: Record<string, any> | undefined;
          rtcInbounds: Record<string, Record<string, RTCInboundRtpStreamStats>>;
        };

        const rtcStats: RTCStatsType = {
          videoRtcOutbound: undefined,
          audioRtcOutbound: undefined,
          rtcCandidatePair: undefined,
          videoRtcRemoteInbound: undefined,
          audioRtcRemoteInbound: undefined,
          rtcInbounds: {},
        };

        for (const report of stats.values()) {
          if (report.type === 'outbound-rtp') {
            const rtcOutbound: RTCOutboundRtpStreamStats = report;
            if (rtcOutbound.kind === 'video') {
              rtcStats.videoRtcOutbound = rtcOutbound;
            } else if (rtcOutbound.kind === 'audio') {
              rtcStats.audioRtcOutbound = rtcOutbound;
            }
          } else if (report.type === 'candidate-pair') {
            const rtcCandidatePair: RTCIceCandidatePairStats = report;

            if (rtcCandidatePair.state === 'succeeded') {
              rtcStats.rtcCandidatePair = rtcCandidatePair;
            }
          } else if (report.type === 'remote-inbound-rtp') {
            const rtcRemoteInbound = report;
            if (rtcRemoteInbound.kind === 'video') {
              rtcStats.videoRtcRemoteInbound = rtcRemoteInbound;
            } else if (rtcRemoteInbound.kind === 'audio') {
              rtcStats.audioRtcRemoteInbound = rtcRemoteInbound;
            }
          } else if (report.type === 'inbound-rtp') {
            const rtcInbound: RTCInboundRtpStreamStats = report;
            const stream = peer.getStreamByTrackId(rtcInbound.trackIdentifier);

            if (stream) {
              rtcStats.rtcInbounds[stream.mediaStream.id] = {
                ...rtcStats.rtcInbounds[stream.mediaStream.id],
                [rtcInbound.trackIdentifier]: rtcInbound,
              };
            }
          }
        }

        document.dispatchEvent(
          new CustomEvent('send:rtc-stats', {
            detail: rtcStats,
          })
        );
      } catch (error) {
        console.error(error);
      }
    };

    document.addEventListener('enable:debug-webrtc-stats', sendWebrtcStats);

    return () => {
      document.removeEventListener(
        'enable:debug-webrtc-stats',
        sendWebrtcStats
      );
    };
  }, [peer]);

  return (
    <PeerContext.Provider
      value={{
        peer: peer,
        debug: debug,
        connectionState: connectionState,
        roomID: roomID,
      }}
    >
      {children}
    </PeerContext.Provider>
  );
}
