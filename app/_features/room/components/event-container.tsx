'use client';
import { useEffect, useRef } from 'react';
import { usePeerContext } from '@/_features/room/contexts/peer-context';
import { useParticipantContext } from '@/_features/room/contexts/participant-context';
import { hasTouchScreen } from '@/_shared/utils/has-touch-screen';

declare global {
  interface Window {
    enableDebug: () => void;
    disableDebug: () => void;
  }
}

export default function EventContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  const { peer } = usePeerContext();
  const { streams } = useParticipantContext();
  const didMount = useRef(false);

  useEffect(() => {
    if (!peer) return;

    const localStream = streams.find(
      (stream) => stream.origin === 'local' && stream.source === 'media'
    );

    if (!localStream) return;

    const onTurnOnCamera = () => {
      if (peer && localStream) peer.turnOnCamera();
    };

    const onTurnOffCamera = () => {
      if (peer && localStream) peer.turnOffCamera();
    };

    const onTurnOnMic = () => {
      if (peer && localStream) peer.turnOnMic();
    };

    const onTurnOffMic = () => {
      if (peer && localStream) peer.turnOffMic();
    };

    document.addEventListener('trigger:turnon-camera', onTurnOnCamera);
    document.addEventListener('trigger:turnoff-camera', onTurnOffCamera);
    document.addEventListener('trigger:turnon-mic', onTurnOnMic);
    document.addEventListener('trigger:turnoff-mic', onTurnOffMic);

    if (!didMount.current) {
      //mute mic on first mount
      document.dispatchEvent(new CustomEvent('trigger:turnoff-mic'));
      didMount.current = true;
    }

    return () => {
      document.removeEventListener('trigger:turnon-camera', onTurnOnCamera);
      document.removeEventListener('trigger:turnoff-camera', onTurnOffCamera);
      document.removeEventListener('trigger:turnon-mic', onTurnOnMic);
      document.removeEventListener('trigger:turnoff-mic', onTurnOffMic);
    };
  }, [peer, streams]);

  useEffect(() => {
    if (!peer) return;

    const isTouchScreen = hasTouchScreen();

    const onWindowBlur = () => {
      if (isTouchScreen && peer) {
        document.dispatchEvent(new CustomEvent('trigger:turnoff-camera'));
        document.dispatchEvent(new CustomEvent('trigger:turnoff-mic'));
      }
    };

    window.addEventListener('blur', onWindowBlur);

    return () => {
      window.removeEventListener('blur', onWindowBlur);
    };
  }, [peer]);

  // use effect for dispatching the webrtc stats
  useEffect(() => {
    const peerConnection = peer?.getPeerConnection();

    if (!peer || !peerConnection) return;

    let dispatcherInterval: ReturnType<typeof setInterval> | undefined =
      undefined;

    const enableDebugWebrtcStats = () => {
      const peerConnection = peer?.getPeerConnection();
      if (!peer || !peerConnection) {
        if (typeof dispatcherInterval !== 'undefined') {
          clearInterval(dispatcherInterval);
          dispatcherInterval = undefined;
        }

        return;
      }

      if (typeof dispatcherInterval === 'undefined') {
        const dispatchWebrtcStats = async () => {
          try {
            const stats = await peerConnection.getStats();

            type RTCStatsType = {
              videoRtcOutbound: RTCOutboundRtpStreamStats | undefined;
              audioRtcOutbound: RTCOutboundRtpStreamStats | undefined;
              rtcCandidatePair: RTCIceCandidatePairStats | undefined;
              videoRtcRemoteInbound: Record<string, any> | undefined;
              audioRtcRemoteInbound: Record<string, any> | undefined;
              rtcInbounds: Record<
                string,
                Record<string, RTCInboundRtpStreamStats>
              >;
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
                const stream = peer.getStreamByTrackId(
                  rtcInbound.trackIdentifier
                );

                if (stream) {
                  rtcStats.rtcInbounds[stream.mediaStream.id] = {
                    ...rtcStats.rtcInbounds[stream.mediaStream.id],
                    [rtcInbound.trackIdentifier]: rtcInbound,
                  };
                }
              }
            }

            document.dispatchEvent(
              new CustomEvent('trigger:rtc-stats', {
                detail: rtcStats,
              })
            );
          } catch (error) {
            console.error(error);
          }
        };

        dispatcherInterval = setInterval(dispatchWebrtcStats, 1500);
      }
    };

    const disableDebugWebrtcStats = () => {
      if (typeof dispatcherInterval !== 'undefined') {
        clearInterval(dispatcherInterval);
        dispatcherInterval = undefined;
      }
    };

    const enableDebug = () => {
      if (typeof dispatcherInterval === 'undefined') {
        document.dispatchEvent(new CustomEvent('enable:debug-webrtc-stats'));
      }
    };

    const disableDebug = () => {
      if (typeof dispatcherInterval !== 'undefined') {
        document.dispatchEvent(new CustomEvent('disable:debug-webrtc-stats'));
      }
    };

    window.enableDebug = enableDebug;
    window.disableDebug = disableDebug;

    document.addEventListener(
      'enable:debug-webrtc-stats',
      enableDebugWebrtcStats
    );

    document.addEventListener(
      'disable:debug-webrtc-stats',
      disableDebugWebrtcStats
    );

    return () => {
      clearInterval(dispatcherInterval);
      dispatcherInterval = undefined;
      document.removeEventListener(
        'enable:debug-webrtc-stats',
        enableDebugWebrtcStats
      );
      document.removeEventListener(
        'disable:debug-webrtc-stats',
        disableDebugWebrtcStats
      );
    };
  }, [peer]);

  return <>{children}</>;
}
