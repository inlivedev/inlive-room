'use client';

import { useEffect, useRef, useState, useMemo,useCallback, memo } from 'react';
import { Button } from '@nextui-org/react';
import React from "react";
import type { ParticipantVideo } from '@/_features/room/components/conference';
import { usePeerContext } from '@/_features/room/contexts/peer-context';
import MoreIcon from '@/_shared/components/icons/more-icon';
import { useMetadataContext } from '@/_features/room/contexts/metadata-context';
import { type SVGElementPropsType } from '@/_shared/types/types';
import ParticipantDropdownMenu from './participant-dropdown-menu';

function ConferenceScreen({
  stream,
  currentAudioOutput,
  debug
}: {
  stream: ParticipantVideo;
  currentAudioOutput: MediaDeviceInfo|undefined;
  debug?: boolean;
}) {
	console.log("ConferenceScreen rendered");
  return  <OverlayScreen stream={stream}>
  <VideoScreen stream={stream} currentAudioOutput={currentAudioOutput} />
</OverlayScreen>;
}

export default React.memo(ConferenceScreen);

function OverlayScreen({
  children,
  stream,
}: {
  children: React.ReactNode;
  stream: ParticipantVideo;
}) {
  const { peer } = usePeerContext();
  const { moderatorClientIDs } = useMetadataContext();

  const isHost = moderatorClientIDs.includes(stream.clientId);
  const [rtcLocalStats, setRtcLocalStats] = useState({
    videoRtcOutbound: undefined as RTCOutboundRtpStreamStats | undefined,
    audioRtcOutbound: undefined as RTCOutboundRtpStreamStats | undefined,
    rtcCandidatePair: undefined as RTCIceCandidatePairStats | undefined,
    videoRtcRemoteInbound: undefined as Record<string, any> | undefined,
    audioRtcRemoteInbound: undefined as Record<string, any> | undefined,
  });

  const [rtcRemoteStats, setRtcRemoteStats] = useState({
    videoRtcInbound: undefined as RTCInboundRtpStreamStats | undefined,
    audioRtcInbound: undefined as RTCInboundRtpStreamStats | undefined,
  });

  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    const onRTCStats = ((event: CustomEvent) => {
      const rtcEventStats = event.detail;
      if (!peer || !stream || !rtcEventStats) return;

      if (stream.origin === 'local') {
        setRtcLocalStats({
          videoRtcOutbound: rtcEventStats.videoRtcOutbound,
          audioRtcOutbound: rtcEventStats.audioRtcOutbound,
          rtcCandidatePair: rtcEventStats.rtcCandidatePair,
          videoRtcRemoteInbound: rtcEventStats.videoRtcRemoteInbound,
          audioRtcRemoteInbound: rtcEventStats.audioRtcRemoteInbound,
        });
      } else if (stream.origin === 'remote') {
        const rtcInbounds = rtcEventStats.rtcInbounds || {};
        const rtcInbound = rtcInbounds[stream.mediaStream.id];

        const videoTrack = stream.mediaStream.getVideoTracks()[0];
        const audioTrack = stream.mediaStream.getAudioTracks()[0];

        setRtcRemoteStats({
          videoRtcInbound: rtcInbound[videoTrack?.id],
          audioRtcInbound: rtcInbound[audioTrack?.id],
        });
      }
    }) as EventListener;

    const enableDebugWebrtcStats = () => {
      setShowStats(true);
    };

    const disableDebugWebrtcStats = () => {
      setShowStats(false);
    };

    document.addEventListener(
      'enable:debug-webrtc-stats',
      enableDebugWebrtcStats
    );
    document.addEventListener(
      'disable:debug-webrtc-stats',
      disableDebugWebrtcStats
    );
    document.addEventListener('send:rtc-stats', onRTCStats);

    return () => {
      document.removeEventListener(
        'enable:debug-webrtc-stats',
        enableDebugWebrtcStats
      );
      document.removeEventListener(
        'disable:debug-webrtc-stats',
        disableDebugWebrtcStats
      );
      document.removeEventListener('send:rtc-stats', onRTCStats);
    };
  }, [peer, stream]);

  return (
    <div
      className={`groupflex h-full w-full max-w-full flex-col rounded-lg bg-zinc-700/70 shadow-lg ${
        stream.fullscreen ? 'fixed-fullscreen !bg-zinc-900' : ''
      }`}
    >
      {/* stats debug overlay */}
      {showStats ? (
        <div className="absolute z-20 h-full w-full p-2">
          {stream.origin === 'local' ? (
            <div className="inline-block w-auto rounded-md bg-zinc-600/80 p-2">
              <div className="flex flex-col gap-1">
                <div className="flex gap-1.5 text-xs leading-4">
                  <div className="w-28 font-semibold">Resolution</div>
                  <div className="w-32 truncate font-medium">
                    {typeof rtcLocalStats.videoRtcOutbound?.frameWidth !==
                      'undefined' &&
                    typeof rtcLocalStats.videoRtcOutbound?.frameHeight !==
                      'undefined'
                      ? `${rtcLocalStats.videoRtcOutbound.frameWidth} x ${rtcLocalStats.videoRtcOutbound.frameHeight}`
                      : '-'}
                  </div>
                </div>
                <div className="flex gap-1.5 text-xs leading-4">
                  <div className="w-28 font-semibold">Frames per second</div>
                  <div className="w-32 truncate font-medium">
                    {typeof rtcLocalStats.videoRtcOutbound?.framesPerSecond !==
                    'undefined'
                      ? rtcLocalStats.videoRtcOutbound.framesPerSecond
                      : '-'}
                    {}
                  </div>
                </div>
                <div className="flex gap-1.5 text-xs leading-4">
                  <div className="w-28 font-semibold">Video fraction lost</div>
                  <div className="w-32 truncate font-medium">
                    {typeof rtcLocalStats.videoRtcRemoteInbound
                      ?.fractionLost !== 'undefined'
                      ? rtcLocalStats.videoRtcRemoteInbound.fractionLost
                      : '-'}
                  </div>
                </div>
                <div className="flex gap-1.5 text-xs leading-4">
                  <div className="w-28 font-semibold">Audio fraction lost</div>
                  <div className="w-32 truncate font-medium">
                    {typeof rtcLocalStats.audioRtcRemoteInbound
                      ?.fractionLost !== 'undefined'
                      ? rtcLocalStats.audioRtcRemoteInbound.fractionLost
                      : '-'}
                  </div>
                </div>
                <div className="flex gap-1.5 text-xs leading-4">
                  <div className="w-28 font-semibold">
                    Picture loss indication sent
                  </div>
                  <div className="w-32 truncate font-medium">
                    {typeof rtcLocalStats.videoRtcOutbound?.pliCount !==
                    'undefined'
                      ? rtcLocalStats.videoRtcOutbound.pliCount
                      : '-'}
                    {}
                  </div>
                </div>
                <div className="flex gap-1.5 text-xs leading-4">
                  <div className="w-28 font-semibold">NACK packets sent</div>
                  <div className="w-32 truncate font-medium">
                    {typeof rtcLocalStats.videoRtcOutbound?.nackCount !==
                    'undefined'
                      ? rtcLocalStats.videoRtcOutbound.nackCount
                      : '-'}
                    {}
                  </div>
                </div>
                <div className="flex gap-1.5 text-xs leading-4">
                  <div className="w-28 font-semibold">
                    Quality limitation reason
                  </div>
                  <div className="w-32 truncate font-medium">
                    {typeof rtcLocalStats.videoRtcOutbound !== 'undefined'
                      ? // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        rtcLocalStats.videoRtcOutbound.qualityLimitationReason
                      : '-'}
                  </div>
                </div>
                <div className="flex gap-1.5 text-xs leading-4">
                  <div className="w-28 font-semibold">
                    Available outgoing bitrate
                  </div>
                  <div className="w-32 truncate font-medium">
                    {typeof rtcLocalStats.rtcCandidatePair
                      ?.availableOutgoingBitrate !== 'undefined'
                      ? rtcLocalStats.rtcCandidatePair.availableOutgoingBitrate
                      : '-'}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="inline-block w-auto rounded-md bg-zinc-600/80 p-2">
              <div className="flex flex-col gap-1">
                <div className="flex gap-1.5 text-xs leading-4">
                  <div className="w-28 font-semibold">Resolution</div>
                  <div className="w-32 truncate font-medium">
                    {typeof rtcRemoteStats.videoRtcInbound?.frameWidth !==
                      'undefined' &&
                    typeof rtcRemoteStats.videoRtcInbound?.frameHeight !==
                      'undefined'
                      ? `${rtcRemoteStats.videoRtcInbound.frameWidth} x ${rtcRemoteStats.videoRtcInbound.frameHeight}`
                      : '-'}
                  </div>
                </div>
                <div className="flex gap-1.5 text-xs leading-4">
                  <div className="w-28 font-semibold">Frames per second</div>
                  <div className="w-32 truncate font-medium">
                    {typeof rtcRemoteStats.videoRtcInbound?.framesPerSecond !==
                    'undefined'
                      ? rtcRemoteStats.videoRtcInbound.framesPerSecond
                      : '-'}
                    {}
                  </div>
                </div>
                <div className="flex gap-1.5 text-xs leading-4">
                  <div className="w-28 font-semibold">
                    Picture loss indication sent
                  </div>
                  <div className="w-32 truncate font-medium">
                    {typeof rtcRemoteStats.videoRtcInbound?.pliCount !==
                    'undefined'
                      ? rtcRemoteStats.videoRtcInbound.pliCount
                      : '-'}
                    {}
                  </div>
                </div>
                <div className="flex gap-1.5 text-xs leading-4">
                  <div className="w-28 font-semibold">NACK packets sent</div>
                  <div className="w-32 truncate font-medium">
                    {typeof rtcRemoteStats.videoRtcInbound?.nackCount !==
                    'undefined'
                      ? rtcRemoteStats.videoRtcInbound.nackCount
                      : '-'}
                    {}
                  </div>
                </div>
                <div className="flex gap-1.5 text-xs leading-4">
                  <div className="w-28 font-semibold">Jitter</div>
                  <div className="w-32 truncate font-medium">
                    {typeof rtcRemoteStats.videoRtcInbound?.jitter !==
                    'undefined'
                      ? rtcRemoteStats.videoRtcInbound.jitter
                      : '-'}
                    {}
                  </div>
                </div>
                <div className="flex gap-1.5 text-xs leading-4">
                  <div className="w-28 font-semibold">
                    Number of times video freezes
                  </div>
                  <div className="w-32 truncate font-medium">
                    {
                      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                      // @ts-ignore
                      typeof rtcRemoteStats.videoRtcInbound?.freezeCount !==
                      'undefined'
                        ? // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                          // @ts-ignore
                          rtcRemoteStats.videoRtcInbound.freezeCount
                        : '-'
                    }
                  </div>
                </div>
                <div className="flex gap-1.5 text-xs leading-4">
                  <div className="w-28 font-semibold">Packets lost</div>
                  <div className="w-32 truncate font-medium">
                    {typeof rtcRemoteStats.videoRtcInbound?.packetsLost !==
                    'undefined'
                      ? rtcRemoteStats.videoRtcInbound.packetsLost
                      : '-'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : null}
      {/* video screen overlay */}
      <div className="absolute z-10 flex h-full w-full flex-col justify-between overflow-hidden rounded-lg p-2">
        <div className="flex items-center justify-between gap-3 text-[0] leading-[0]">
          <div className="flex items-center gap-1.5">
            {stream.spotlight && (
              <div title="Spotlighted for everyone">
                <div className="rounded-full bg-zinc-700/70 p-1 text-zinc-200">
                  <SparkleIcon className="h-5 w-5" />
                </div>
              </div>
            )}
            {stream.pin && (
              <div title="Pinned for myself">
                <div className="rounded-full bg-zinc-700/70 p-1 text-zinc-200">
                  <PinIcon className="h-5 w-5" />
                </div>
              </div>
            )}
          </div>
          <div>
            <ParticipantDropdownMenu stream={stream}>
              <Button className="h-auto min-h-0 min-w-0 rounded-full bg-zinc-700/70 p-1 text-zinc-200 antialiased opacity-0 hover:bg-zinc-700 active:bg-zinc-600 group-hover:opacity-100 group-active:opacity-100">
                <MoreIcon className="h-5 w-5" />
              </Button>
            </ParticipantDropdownMenu>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 flex max-w-full rounded-tr-md bg-zinc-700/70 px-2 py-1.5">
          <div className="max-w-full truncate text-xs font-medium text-zinc-100">
            <span>
              {isHost && stream.origin === 'local'
                ? '(Host) You'
                : stream.origin === 'local'
                ? 'You'
                : isHost
                ? `(Host) ${stream.name}`
                : stream.name}
            </span>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}

function VideoScreen({
  stream,
  currentAudioOutput,
}: {
  stream: ParticipantVideo;
  currentAudioOutput: MediaDeviceInfo|undefined;
}) {

  const videoContainerRef = useRef<HTMLDivElement>(null);

  const streamMemo = useMemo(() => stream, [stream]);

  useEffect(() => {
    const callbackVoiceActivity = (e: CustomEventInit) => {
      if (videoContainerRef.current === null) return;
      if (e.detail.audioLevel > 0) {
        videoContainerRef.current.style.borderColor = 'green';
        videoContainerRef.current.style.borderWidth = '5px';
        videoContainerRef.current.style.borderStyle = 'solid';
        videoContainerRef.current.style.margin = '-5px';
        videoContainerRef.current.style.boxSizing = 'content-box';
      } else {
        videoContainerRef.current.style.borderColor = 'transparent';
        videoContainerRef.current.style.borderWidth = '0';
        videoContainerRef.current.style.borderStyle = 'none';
        videoContainerRef.current.style.margin = '0';
      }
    };

    if (stream.origin === 'remote') {
      stream.addEventListener('voiceactivity', callbackVoiceActivity);
    }

    return () => {
      if (stream.origin === 'remote') {
        stream.removeEventListener('voiceactivity', callbackVoiceActivity);
      }
    };
  }, [stream]);

  const setSink = useCallback(async () => {
    if (
      currentAudioOutput &&
      !AudioContext.prototype.hasOwnProperty('setSinkId')
    ) {
      const sinkId =
        currentAudioOutput.deviceId !== 'default'
          ? currentAudioOutput.deviceId
          : '';

      if (
        HTMLMediaElement.prototype.hasOwnProperty('setSinkId') &&
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        sinkId !== videoRef.current.sinkId
      ) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        await videoRef.current.setSinkId(sinkId);
      }
    }
  }, [currentAudioOutput]);

  useEffect(() => {
    setSink();
  }, [currentAudioOutput]);

  return (
    <div
      ref={videoContainerRef}
    >
     <Video
        srcObject={streamMemo.mediaStream}
        origin={streamMemo.origin}
      ></Video>
    </div>
  );
}

function SparkleIcon(props: SVGElementPropsType) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M9 4.5a.75.75 0 0 1 .721.544l.813 2.846a3.75 3.75 0 0 0 2.576 2.576l2.846.813a.75.75 0 0 1 0 1.442l-2.846.813a3.75 3.75 0 0 0-2.576 2.576l-.813 2.846a.75.75 0 0 1-1.442 0l-.813-2.846a3.75 3.75 0 0 0-2.576-2.576l-2.846-.813a.75.75 0 0 1 0-1.442l2.846-.813A3.75 3.75 0 0 0 7.466 7.89l.813-2.846A.75.75 0 0 1 9 4.5m9-3a.75.75 0 0 1 .728.568l.258 1.036a2.63 2.63 0 0 0 1.91 1.91l1.036.258a.75.75 0 0 1 0 1.456l-1.036.258a2.63 2.63 0 0 0-1.91 1.91l-.258 1.036a.75.75 0 0 1-1.456 0l-.258-1.036a2.625 2.625 0 0 0-1.91-1.91l-1.036-.258a.75.75 0 0 1 0-1.456l1.036-.258a2.625 2.625 0 0 0 1.91-1.91l.258-1.036A.75.75 0 0 1 18 1.5M16.5 15a.75.75 0 0 1 .712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 0 1 0 1.422l-1.183.395a1.5 1.5 0 0 0-.948.948l-.395 1.183a.75.75 0 0 1-1.422 0l-.395-1.183a1.5 1.5 0 0 0-.948-.948l-1.183-.395a.75.75 0 0 1 0-1.422l1.183-.395a1.5 1.5 0 0 0 .948-.948l.395-1.183A.75.75 0 0 1 16.5 15"
        clipRule="evenodd"
      />
    </svg>
  );
}

function PinIcon(props: SVGElementPropsType) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2z"
      />
    </svg>
  );
}

function Video({
  srcObject,
  origin,
}: {
  srcObject: MediaStream;
  origin?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const srcObjectMemo = useMemo(() => srcObject, [srcObject]);

  useEffect(() => {
    const playVideo = async () => {
      if (videoRef.current === null) return;
      videoRef.current.srcObject = srcObjectMemo;
      await videoRef.current.play().catch((err) => {
        console.error(err);
      });
    };

    playVideo();
    return () => {};
  }, [srcObjectMemo]);

  const { peer } = usePeerContext();

  useEffect(() => {
    if (origin === 'remote' && videoRef.current) {
      console.log('observe video ', origin);
      peer?.observeVideo(videoRef.current);
    }
    return () => {
      if (origin === 'remote' && videoRef.current) {
        console.log('unobserve video ', origin);
        peer?.unobserveVideo(videoRef.current);
      }
    };
  }, [srcObjectMemo]);

  return (
    <video ref={videoRef} className="h-full w-full" playsInline autoPlay />
  );
}
