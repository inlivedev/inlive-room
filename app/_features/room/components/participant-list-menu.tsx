'use client';

import { useCallback, Key } from 'react';
import Image from 'next/image';
import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@nextui-org/react';
import * as Sentry from '@sentry/nextjs';
import { clientSDK } from '@/_shared/utils/sdk';
import MoreIcon from '@/_shared/components/icons/more-icon';
import XFillIcon from '@/_shared/components/icons/x-fill-icon';
import ChevronRight from '@/_shared/components/icons/chevron-right';
import CheckIcon from '@/_shared/components/icons/check-icon';
import { useToggle } from '@/_shared/hooks/use-toggle';
import { useClientContext } from '@/_features/room/contexts/client-context';
import {
  type ParticipantVideo,
  useParticipantContext,
} from '@/_features/room/contexts/participant-context';
import { useMetadataContext } from '@/_features/room/contexts/metadata-context';
import { useDataChannelContext } from '@/_features/room/contexts/datachannel-context';

export default function ParticipantListMenu() {
  return (
    <div className="grid h-full w-full grid-rows-[auto,1fr]">
      <div className="border-b border-zinc-700 px-3 py-4 text-base font-semibold text-zinc-300">
        <div className="flex items-center justify-between">
          <div className="flex-1">Participants</div>
          <div className="text-[0px] leading-[0]">
            <Button
              className="h-auto min-h-0 min-w-0 rounded-full bg-transparent p-1.5 antialiased hover:bg-zinc-700 active:bg-zinc-600"
              onClick={() =>
                document.dispatchEvent(
                  new CustomEvent('close:right-drawer-menu')
                )
              }
            >
              <XFillIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      <div className="flex-1 px-3 py-4">
        <ParticipantListGroup />
      </div>
    </div>
  );
}

const ParticipantListGroup = ({ show = true }) => {
  const { active, toggle } = useToggle(show);
  const { streams } = useParticipantContext();
  const participants = streams.filter((stream) => stream.source === 'media');

  return (
    <div>
      <div className="flex h-9 items-center gap-1.5">
        <div className="flex items-center">
          <Button
            className="h-7 min-h-0 w-7 min-w-0 rounded-full bg-transparent p-0 antialiased hover:bg-zinc-700 active:bg-zinc-600"
            onPress={toggle}
          >
            <ChevronRight
              className={`h-4 w-4 transition-all ${active ? 'rotate-90' : ''}`}
            />
          </Button>
        </div>
        <div className="flex-1">
          <b className="block text-sm font-semibold text-zinc-200">
            In the room ({participants.length})
          </b>
        </div>
      </div>
      {active ? (
        <ul className="flex flex-col">
          {participants.map((stream) => {
            return (
              <li key={`participant-${stream.id}`}>
                <ParticipantsListItem stream={stream} />
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
};

const ParticipantsListItem = ({ stream }: { stream: ParticipantVideo }) => {
  const { roomID, clientID } = useClientContext();
  const {
    speakerClientIDs,
    spotlights,
    moderatorClientIDs,
    isModerator,
    roomType,
    currentLayout,
  } = useMetadataContext();
  const { datachannels } = useDataChannelContext();
  const isHost = moderatorClientIDs.includes(stream.clientId);

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

  type Identifier = { id: string; name: string };

  const identifiers: Identifier[] = [];

  if (isHost) {
    identifiers.push({
      id: 'host',
      name: 'host',
    });
  }

  if (stream.origin === 'local') {
    identifiers.push({
      id: 'local',
      name: 'you',
    });
  }

  return (
    <div className="flex items-center gap-2.5 py-2">
      <div>
        <Image
          referrerPolicy="no-referrer"
          src={`https://api.dicebear.com/8.x/initials/svg?seed=${stream.name}`}
          alt={`Image of ${stream.name}`}
          loading="lazy"
          width={36}
          height={36}
          className="h-9 w-9 overflow-hidden rounded-full"
          unoptimized
        />
      </div>
      <div className="flex-1">
        <b className="block break-words text-sm font-semibold text-zinc-200">
          {stream.name}
        </b>
        {identifiers.length > 0 ? (
          <div className="break-words text-[13px] leading-[18px] text-zinc-400">
            {identifiers.map((identifier, index) => {
              if (index === 0) {
                return (
                  <span
                    key={`${identifier.id}-${index}`}
                    className="capitalize"
                  >
                    {identifier.name}
                  </span>
                );
              } else {
                return (
                  <span key={`${identifier.id}-${index}`}>
                    ,&nbsp;{identifier.name}
                  </span>
                );
              }
            })}
          </div>
        ) : null}
      </div>
      <div>
        <Dropdown placement="bottom" className="ring-1 ring-zinc-800/70">
          <DropdownTrigger>
            <Button className="h-auto min-h-0 min-w-0 rounded-full bg-transparent p-1.5 antialiased hover:bg-zinc-700 active:bg-zinc-600">
              <MoreIcon className="h-5 w-5" />
            </Button>
          </DropdownTrigger>
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
              isModerator &&
              stream.origin === 'remote' &&
              stream.source === 'media'
                ? [
                    <DropdownItem key="remove-client">
                      Remove this participant
                    </DropdownItem>,
                  ]
                : undefined,
            ]}
          </DropdownMenu>
        </Dropdown>
      </div>
    </div>
  );
};
