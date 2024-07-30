'use client';

import { Button } from '@nextui-org/react';
import MoreIcon from '@/_shared/components/icons/more-icon';
import XFillIcon from '@/_shared/components/icons/x-fill-icon';
import ChevronRight from '@/_shared/components/icons/chevron-right';
import { useToggle } from '@/_shared/hooks/use-toggle';
import {
  type ParticipantVideo,
  useParticipantContext,
} from '@/_features/room/contexts/participant-context';
import { useMetadataContext } from '@/_features/room/contexts/metadata-context';
import ParticipantDropdownMenu from './participant-dropdown-menu';

export default function ParticipantListSidebar() {
  return (
    <div className="grid h-full w-full grid-rows-[auto,1fr]">
      <div className="border-b border-black/25 px-4 py-2.5">
        <div className="flex items-center justify-between">
          <div className="flex-1 text-lg font-semibold text-zinc-900">
            Participants
          </div>
          <div className="text-[0px] leading-[0]">
            <Button
              className="h-auto min-h-0 min-w-0 rounded-full bg-transparent p-1.5 text-zinc-900 antialiased hover:bg-zinc-200 active:bg-zinc-100"
              onClick={() =>
                document.dispatchEvent(
                  new CustomEvent('close:right-drawer-menu')
                )
              }
            >
              <XFillIcon className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-4">
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
            className="h-7 min-h-0 w-7 min-w-0 rounded-full bg-transparent p-0 text-zinc-900 antialiased hover:bg-zinc-200 active:bg-zinc-100"
            onPress={toggle}
          >
            <ChevronRight
              className={`h-4 w-4 transition-all ${active ? 'rotate-90' : ''}`}
            />
          </Button>
        </div>
        <div className="flex-1">
          <b className="block text-sm font-semibold text-zinc-900">
            In the room ({participants.length})
          </b>
        </div>
      </div>
      {active && participants.length > 0 ? (
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
  const { moderatorClientIDs } = useMetadataContext();
  const isHost = moderatorClientIDs.includes(stream.clientId);
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
        <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-zinc-800 text-2xl font-semibold uppercase text-zinc-50">
          {stream.name[0]}
        </div>
      </div>
      <div className="flex-1">
        <b className="block break-words text-sm font-semibold text-zinc-900">
          {stream.name}
        </b>
        {identifiers.length > 0 ? (
          <div className="break-words text-[13px] leading-[18px] text-zinc-500">
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
        <ParticipantDropdownMenu stream={stream}>
          <Button className="h-auto min-h-0 min-w-0 rounded-full bg-transparent p-1.5 text-zinc-900 antialiased hover:bg-zinc-200 active:bg-zinc-100">
            <MoreIcon className="h-5 w-5" />
          </Button>
        </ParticipantDropdownMenu>
      </div>
    </div>
  );
};
