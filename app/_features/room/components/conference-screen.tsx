'use client';

import { useEffect } from 'react';
import { Button } from '@nextui-org/react';
import { useVideoScreen } from '@/_features/room/hooks/use-video-screen';
import type { ParticipantStream } from '@/_features/room/contexts/participant-context';
import { usePeerContext } from '@/_features/room/contexts/peer-context';
import styles from '@/_features/room/styles/conference.module.css';
import XFillIcon from '@/_shared/components/icons/x-fill-icon';
import { useDataChannelContext } from '@/_features/room/contexts/datachannel-context';

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

  useEffect(() => {
    const videoEl = videoRef.current;
    if (videoEl && stream.origin === 'remote') peer?.observeVideo(videoEl);

    return () => {
      if (videoEl && stream.origin === 'remote') peer?.unobserveVideo(videoEl);
    };
  }, [peer, stream.origin, videoRef]);

  const handleRemoveParticipant = () => {
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
  };

  return (
    <div
      className={`${styles['video-screen']} group relative rounded-lg shadow-lg`}
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
              className="absolute right-1 top-1 h-8 w-8 rounded-full bg-zinc-700/70 text-zinc-100 opacity-0 hover:!bg-zinc-700 active:bg-zinc-600 group-hover:opacity-100 group-active:opacity-100 md:h-9 md:w-9"
              title="Remove this participant"
              onClick={handleRemoveParticipant}
            >
              <XFillIcon className="h-4 w-4" />
            </Button>
          )}
        <div className="flex">
          <div
            className={`${styles['video-screen-name']} max-w-full truncate rounded bg-zinc-900/70 px-2 py-0.5 text-xs font-medium text-zinc-100 md:text-sm`}
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
      <video className="h-full rounded-lg object-center" ref={videoRef}></video>
    </div>
  );
}
