'use client';

import { useCallback, Key, useEffect } from 'react';
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from '@nextui-org/react';
import { useVideoScreen } from '@/_features/room/hooks/use-video-screen';
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
  isModerator,
}: {
  stream: ParticipantStream;
  isModerator: boolean;
}) {
  const { videoRef } = useVideoScreen(stream);
  const { peer } = usePeerContext();
  const { datachannels } = useDataChannelContext();
  const { roomID } = useClientContext();
  const { speakers } = useMetadataContext();

  useEffect(() => {
    const videoEl = videoRef.current;
    if (videoEl && stream.origin === 'remote') peer?.observeVideo(videoEl);

    return () => {
      if (videoEl && stream.origin === 'remote') peer?.unobserveVideo(videoEl);
    };
  }, [peer, stream.origin, videoRef]);

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

        const foundSpeaker = speakers.find(
          (speaker) => speaker === stream.clientId
        );

        if (confirmed && !foundSpeaker) {
          await clientSDK.setMetadata(roomID, {
            speakers: [...speakers, stream.clientId],
          });
        }
      } else if (key === 'set-regular-participant') {
        if (!isModerator) return;

        const confirmed = confirm(
          'Are you sure you want to set this speaker as a regular participant?'
        );

        const foundSpeaker = speakers.find(
          (speaker) => speaker === stream.clientId
        );

        if (confirmed && foundSpeaker) {
          const newSpeakers = speakers.filter((speaker) => {
            speaker !== stream.clientId;
          });

          await clientSDK.setMetadata(roomID, {
            speakers: newSpeakers,
          });
        }
      }
    },
    [roomID, speakers, stream.clientId, isModerator]
  );

  const localVideoScreen =
    stream.origin === 'local' && stream.source === 'media';

  return (
    <div
      className={`${
        localVideoScreen ? 'local-video-screen' : ''
      } group absolute left-0 top-0 mx-auto flex h-full w-full max-w-full flex-col rounded-lg bg-zinc-700/70 shadow-lg`}
    >
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
        {isModerator && stream.source === 'media' && (
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
              {isModerator && stream.origin === 'local'
                ? 'You (Host)'
                : stream.origin === 'local'
                ? 'You'
                : stream.name}
            </span>
          </div>
        </div>
      </div>
      <video
        className="absolute left-0 top-0 h-full w-full rounded-lg object-center"
        ref={videoRef}
      ></video>
    </div>
  );
}
