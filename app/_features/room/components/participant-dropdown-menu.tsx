'use client';

import { useCallback, type Key } from 'react';
import * as Sentry from '@sentry/nextjs';
import { clientSDK } from '@/_shared/utils/sdk';
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@nextui-org/react';
import { useClientContext } from '@/_features/room/contexts/client-context';
import { type ParticipantVideo } from '@/_features/room/contexts/participant-context';
import { useMetadataContext } from '@/_features/room/contexts/metadata-context';
import { useDataChannelContext } from '@/_features/room/contexts/datachannel-context';
import CheckIcon from '@/_shared/components/icons/check-icon';

export default function ParticipantDropdownMenu({
  stream,
  children,
}: {
  stream: ParticipantVideo;
  children: React.ReactNode;
}) {
  const { roomID, clientID } = useClientContext();
  const { speakerClientIDs, spotlights, isModerator, roomType, currentLayout } =
    useMetadataContext();
  const { datachannels } = useDataChannelContext();

  const onMoreSelection = useCallback(
    async (key: Key) => {
      if (key === 'pin') {
        document.dispatchEvent(
          new CustomEvent('set:pin', {
            detail: {
              active: !stream.pin,
              id: stream.id,
            },
          })
        );
      } else if (key === 'spotlight') {
        try {
          if (stream.spotlight) {
            const newSpotlights = spotlights.filter(
              (spotlight) => spotlight !== stream.id
            );

            await clientSDK.setMetadata(roomID, {
              spotlights: newSpotlights,
            });
          } else {
            await clientSDK.setMetadata(roomID, {
              spotlights: [...spotlights, stream.id],
            });
          }
        } catch (error) {
          Sentry.captureException(error, {
            extra: {
              message: `API call error when trying to set metadata spotlight`,
            },
          });
          console.error(error);
        }
      } else if (key === 'set-speaker') {
        if (!isModerator) return;

        try {
          await clientSDK.setMetadata(roomID, {
            speakerClientIDs: [...speakerClientIDs, stream.clientId],
          });
        } catch (error) {
          Sentry.captureException(error, {
            extra: {
              message: `API call error when trying to set metadata speakerClientIDs`,
            },
          });
          console.error(error);
        }
      } else if (key === 'set-regular-participant') {
        if (!isModerator) return;

        try {
          const newSpeakerClientIDs = speakerClientIDs.filter((speaker) => {
            return speaker !== stream.clientId;
          });

          await clientSDK.setMetadata(roomID, {
            speakerClientIDs: newSpeakerClientIDs,
          });
        } catch (error) {
          Sentry.captureException(error, {
            extra: {
              message: `API call error when trying to set metadata speakerClientIDs`,
            },
          });
          console.error(error);
        }
      } else if (key === 'remove-client') {
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
      }
    },
    [roomID, speakerClientIDs, stream, isModerator, spotlights, datachannels]
  );

  return (
    <Dropdown placement="bottom" className="ring-1 ring-zinc-800/70">
      <DropdownTrigger>{children}</DropdownTrigger>
      <DropdownMenu aria-label="More options" onAction={onMoreSelection}>
        {[
          <DropdownItem key="pin">
            <div className="flex items-center gap-1">
              <span>Pin for myself</span>
              {stream.pin ? (
                <span>
                  <CheckIcon width={16} height={16} />
                </span>
              ) : null}
            </div>
          </DropdownItem>,
          // @ts-ignore
          isModerator
            ? [
                <DropdownItem key="spotlight">
                  <div className="flex items-center gap-1">
                    <span>Spotlight for everyone</span>
                    {stream.spotlight ? (
                      <span>
                        <CheckIcon width={16} height={16} />
                      </span>
                    ) : null}
                  </div>
                </DropdownItem>,
              ]
            : undefined,
          <DropdownItem key="fullscreen-view">
            <div className="flex items-center gap-1">
              <span>Fullscreen view</span>
            </div>
          </DropdownItem>,
          // @ts-ignore
          isModerator &&
          clientID !== stream.clientId &&
          stream.source === 'media' &&
          roomType === 'event' &&
          currentLayout === 'speaker'
            ? [
                speakerClientIDs.includes(stream.clientId) ? (
                  <DropdownItem key="set-regular-participant">
                    Set as a regular participant
                  </DropdownItem>
                ) : (
                  <DropdownItem key="set-speaker">
                    Set as a speaker
                  </DropdownItem>
                ),
              ]
            : undefined,
          // @ts-ignore
          isModerator && stream.origin === 'remote' && stream.source === 'media'
            ? [
                <DropdownItem key="remove-client">
                  Remove this participant
                </DropdownItem>,
              ]
            : undefined,
        ]}
      </DropdownMenu>
    </Dropdown>
  );
}
