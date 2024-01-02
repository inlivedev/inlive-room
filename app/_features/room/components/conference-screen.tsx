'use client';

import { useCallback, Key, useEffect, useRef, useState } from 'react';
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from '@nextui-org/react';
import { useDeviceContext } from '@/_features/room/contexts/device-context';
import type { ParticipantStream } from '@/_features/room/contexts/participant-context';
import { usePeerContext } from '@/_features/room/contexts/peer-context';
import XFillIcon from '@/_shared/components/icons/x-fill-icon';
import { useDataChannelContext } from '@/_features/room/contexts/datachannel-context';
import { clientSDK } from '@/_shared/utils/sdk';
import { useClientContext } from '@/_features/room/contexts/client-context';
import MoreIcon from '@/_shared/components/icons/more-icon';
import { useMetadataContext } from '@/_features/room/contexts/metadata-context';

export default function ConferenceScreen({
  stream,
}: {
  stream: ParticipantStream;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { currentAudioOutput } = useDeviceContext();

  useEffect(() => {
    const play = async () => {
      if (!videoRef.current) {
        return;
      }

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

      videoRef.current.srcObject = stream.mediaStream;
      videoRef.current.playsInline = true;
      videoRef.current.muted = stream.origin === 'local';
      videoRef.current.autoplay = true;
    };

    play();
  }, [videoRef, stream.mediaStream, stream.origin, currentAudioOutput]);

  const { peer } = usePeerContext();
  const { datachannels } = useDataChannelContext();
  const { roomID } = useClientContext();
  const { speakers, moderatorIDs, isModerator, roomType } =
    useMetadataContext();

  const isHost = moderatorIDs.includes(stream.clientId);
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
    const videoEl = videoRef.current;
    if (videoEl && stream.origin === 'remote') peer?.observeVideo(videoEl);

    return () => {
      if (videoEl && stream.origin === 'remote') peer?.unobserveVideo(videoEl);
    };
  }, [peer, stream.origin, videoRef]);

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

  const handleRemoveParticipant = useCallback(async () => {
    if (!isModerator) return;

    const moderatorDataChannel = datachannels.get('moderator');

    const confirmed = confirm(
      'Are you sure you want to remove this participant?'
    );

    if (confirmed && moderatorDataChannel) {
      const message = {
        type: 'remove-client',
        data: {
          clientIDs: [stream.clientId],
        },
      };

      moderatorDataChannel.send(JSON.stringify(message));
    }
  }, [datachannels, isModerator, stream.clientId]);

  const onMoreSelection = useCallback(
    async (key: Key) => {
      if (key === 'set-speaker') {
        if (!isModerator) return;

        const confirmed = confirm(
          'Are you sure you want to set this participant as a speaker?'
        );

        if (confirmed) {
          await clientSDK.setMetadata(roomID, {
            speakers: [...speakers, stream.clientId],
          });
        }
      } else if (key === 'set-regular-participant') {
        if (!isModerator) return;

        const confirmed = confirm(
          'Are you sure you want to set this speaker as a regular participant?'
        );

        if (confirmed) {
          const newSpeakers = speakers.filter((speaker) => {
            return speaker !== stream.clientId;
          });

          await clientSDK.setMetadata(roomID, {
            speakers: newSpeakers,
          });
        }
      }
    },
    [roomID, speakers, stream, isModerator]
  );

  const localVideoScreen =
    stream.origin === 'local' && stream.source === 'media';

  return (
    <div
      className={`${
        localVideoScreen ? 'local-video-screen' : ''
      } group absolute left-0 top-0 mx-auto flex h-full w-full max-w-full flex-col rounded-lg bg-zinc-700/70 shadow-lg`}
    >
      {/* stats debug overlay */}
      {showStats ? (
        <div className="absolute z-20 h-full w-full overflow-hidden p-2">
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
        {isModerator &&
          stream.origin === 'remote' &&
          stream.source === 'media' && (
            <Button
              isIconOnly
              size="sm"
              variant="light"
              aria-label="Remove this participant"
              className="absolute left-1 top-1 h-7 w-7 min-w-0 rounded-full bg-zinc-700/70 text-zinc-100 opacity-0 hover:!bg-zinc-700 active:bg-zinc-600 group-hover:opacity-100 group-active:opacity-100"
              title="Remove this participant"
              onClick={handleRemoveParticipant}
            >
              <XFillIcon className="h-4 w-4" />
            </Button>
          )}
        {isModerator && stream.source === 'media' && roomType === 'event' && (
          <Dropdown placement="bottom" className="ring-1 ring-zinc-800/70">
            <DropdownTrigger>
              <Button
                isIconOnly
                size="sm"
                variant="light"
                className="absolute right-1 top-1 h-7 w-7 min-w-0 rounded-full bg-zinc-700/70 text-zinc-100 opacity-0 hover:!bg-zinc-700 active:bg-zinc-600 group-hover:opacity-100 group-active:opacity-100"
              >
                <MoreIcon className="h-4 w-4" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="More options" onAction={onMoreSelection}>
              {speakers.includes(stream.clientId) ? (
                <DropdownItem key="set-regular-participant">
                  Set as a regular participant
                </DropdownItem>
              ) : (
                <DropdownItem key="set-speaker">Set as a speaker</DropdownItem>
              )}
            </DropdownMenu>
          </Dropdown>
        )}

        <div className="flex">
          <div
            className={`max-w-full truncate rounded bg-zinc-900/70 px-2 py-0.5 text-xs font-medium text-zinc-100`}
          >
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
      <video
        className="absolute left-0 top-0 h-full w-full rounded-lg object-center"
        ref={videoRef}
        style={{
          transform: localVideoScreen ? 'scaleX(-1)' : 'scaleX(1)',
        }}
      ></video>
    </div>
  );
}
