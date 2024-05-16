'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@nextui-org/react';
import { useDeviceContext } from '@/_features/room/contexts/device-context';
import type { ParticipantVideo } from '@/_features/room/contexts/participant-context';
import { usePeerContext } from '@/_features/room/contexts/peer-context';
import MoreIcon from '@/_shared/components/icons/more-icon';
import { useMetadataContext } from '@/_features/room/contexts/metadata-context';
import { type SVGElementPropsType } from '@/_shared/types/types';
import ParticipantDropdownMenu from './participant-dropdown-menu';

export default function ConferenceScreen({
  stream,
  hidden = false,
}: {
  stream: ParticipantVideo;
  hidden?: boolean;
}) {
  return hidden ? (
    <VideoScreen stream={stream} hidden={hidden} />
  ) : (
    <OverlayScreen stream={stream}>
      <VideoScreen stream={stream} hidden={hidden} />
    </OverlayScreen>
  );
}

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
      className={`group absolute left-0 top-0 mx-auto flex h-full w-full max-w-full flex-col rounded-lg bg-zinc-700/70 shadow-lg ${
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
      <div className="absolute z-10 flex h-full w-full flex-col justify-end rounded-lg p-2">
        <ParticipantDropdownMenu stream={stream}>
          <Button
            isIconOnly
            size="sm"
            variant="light"
            className="absolute right-1 top-1 h-7 w-7 min-w-0 rounded-full bg-zinc-700/70 text-zinc-100 opacity-0 hover:!bg-zinc-700 active:bg-zinc-600 group-hover:opacity-100 group-active:opacity-100"
          >
            <MoreIcon className="h-4 w-4" />
          </Button>
        </ParticipantDropdownMenu>
        <div className="flex">
          <div className="flex max-w-full items-center gap-2 rounded bg-zinc-900/70 px-2 py-0.5 text-xs font-medium text-zinc-100">
            {stream.spotlight || stream.pin ? (
              <div className="flex items-center gap-1">
                {stream.spotlight && (
                  <span title="Spotlighted for everyone">
                    <PersonScreenIcon className="h-3.5 w-3.5" />
                  </span>
                )}
                {stream.pin && (
                  <span title="Pinned for myself">
                    <PinIcon className="h-3.5 w-3.5" />
                  </span>
                )}
              </div>
            ) : null}
            <div className={`max-w-full truncate`}>
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
      </div>
      {children}
    </div>
  );
}

function VideoScreen({
  stream,
  hidden = false,
}: {
  stream: ParticipantVideo;
  hidden: boolean;
}) {
  const { peer } = usePeerContext();
  const { currentAudioOutput } = useDeviceContext();
  const videoContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const callbackVoiceActivity = () => {
      if (stream.audioLevel > 0) {
        stream.videoElement.style.borderColor = 'green';
        stream.videoElement.style.borderWidth = '5px';
        stream.videoElement.style.borderStyle = 'solid';
        stream.videoElement.style.margin = '-5px';
        stream.videoElement.style.boxSizing = 'content-box';
      } else {
        stream.videoElement.style.borderColor = 'transparent';
        stream.videoElement.style.borderWidth = '0';
        stream.videoElement.style.borderStyle = 'none';
        stream.videoElement.style.margin = '0';
      }
    };

    if (stream.origin === 'remote') {
      peer?.observeVideo(stream.videoElement);
      stream.addEventListener('voiceactivity', callbackVoiceActivity);
    }

    return () => {
      if (stream.origin === 'remote') {
        peer?.unobserveVideo(stream.videoElement);
        stream.removeEventListener('voiceactivity', callbackVoiceActivity);
      }
    };
  }, [peer, stream]);

  useEffect(() => {
    let videoContainerValue: HTMLDivElement | null = null;

    if (videoContainerRef.current) {
      videoContainerValue = videoContainerRef.current;
    }

    const append = async () => {
      const localVideoScreen =
        stream.origin === 'local' && stream.source === 'media';

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
          sinkId !== stream.videoElement.sinkId
        ) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //@ts-ignore
          await stream.videoElement.setSinkId(sinkId);
        }
      }

      if (hidden) {
        stream.videoElement.style.width = '0';
        stream.videoElement.style.height = '0';
        stream.videoElement.style.opacity = '0';
        stream.videoElement.style.position = 'absolute';
        stream.videoElement.style.right = '-99999px';
      } else {
        stream.videoElement.style.width = '100%';
        stream.videoElement.style.height = '100%';
        stream.videoElement.style.opacity = '1';
        stream.videoElement.style.position = 'absolute';
        stream.videoElement.style.right = 'initial';
        stream.videoElement.style.borderRadius = '0.5rem';
        stream.videoElement.style.objectFit = 'center';
      }

      stream.videoElement.style.transform = localVideoScreen
        ? 'scaleX(-1)'
        : 'scaleX(1)';
      stream.videoElement.playsInline = true;
      stream.videoElement.muted = stream.origin === 'local';
      videoContainerValue?.appendChild(stream.videoElement);
      await stream.videoElement.play();
    };

    append();

    return () => {
      if (videoContainerValue && stream.videoElement) {
        videoContainerValue.removeChild(stream.videoElement);
        videoContainerValue = null;
      }
    };
  }, [stream, hidden, currentAudioOutput]);

  return (
    <div
      ref={videoContainerRef}
      className={`${
        hidden
          ? 'absolute right-[99999px] h-0 w-0 opacity-0'
          : 'grid h-full w-full grid-rows-1 items-center'
      }`}
    ></div>
  );
}

function PersonScreenIcon(props: SVGElementPropsType) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 56" {...props}>
      <path
        fill="currentColor"
        d="M7.715 49.574h40.57c4.899 0 7.36-2.437 7.36-7.265V13.69c0-4.828-2.461-7.265-7.36-7.265H7.715C2.84 6.426.355 8.84.355 13.69v28.62c0 4.851 2.485 7.265 7.36 7.265m20.273-16.71c-4.195 0-7.547-3.563-7.547-8.298c0-4.453 3.352-8.062 7.547-8.062c4.219 0 7.57 3.61 7.57 8.062c0 4.735-3.351 8.297-7.57 8.297m.024 3.679c6.937 0 12.609 2.977 15.703 9.258h-31.43c3.117-6.281 8.766-9.258 15.727-9.258"
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
