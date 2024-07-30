'use client';

import {
  Button,
  CircularProgress,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  type Selection,
} from '@nextui-org/react';
import { useCallback } from 'react';
import { usePeerContext } from '@/_features/room/contexts/peer-context';
import { useClientContext } from '@/_features/room/contexts/client-context';
import { useParticipantContext } from '@/_features/room/contexts/participant-context';
import { useMetadataContext } from '@/_features/room/contexts/metadata-context';
import PlugConnectedFillIcon from '@/_shared/components/icons/plug-connected-fill-icon';
import PlugDisconnectedFillIcon from '@/_shared/components/icons/plug-disconnected-fill-icon';
import ReconnectModal from '@/_features/room/components/reconnect-modal';
import { clientSDK } from '@/_shared/utils/sdk';
import type { SVGElementPropsType } from '@/_shared/types/types';
import type { Sidebar } from './conference';

export default function ConferenceTopBar({ sidebar }: { sidebar: Sidebar }) {
  const { roomType, isModerator } = useMetadataContext();
  const { streams } = useParticipantContext();
  const participants = streams.filter((stream) => stream.source === 'media');

  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center">
        <ConnectionStatusOverlay></ConnectionStatusOverlay>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <Button
          className="h-auto min-h-0 min-w-0 gap-2 rounded-xl bg-zinc-700/70 px-2 py-1.5 text-xs font-medium tabular-nums antialiased hover:bg-zinc-600 active:bg-zinc-500"
          onClick={() => {
            if (sidebar === 'participants') {
              document.dispatchEvent(
                new CustomEvent('close:right-drawer-menu')
              );
            } else {
              document.dispatchEvent(
                new CustomEvent('open:right-drawer-menu', {
                  detail: { menu: 'participants' },
                })
              );
            }
          }}
        >
          <PeopleIcon className="h-5 w-5" />
          <span>{participants.length}</span>
        </Button>
        {roomType === 'event' && isModerator && <DropdownViewSelection />}
      </div>
    </div>
  );
}

function DropdownViewSelection() {
  const { previousLayout, currentLayout } = useMetadataContext();
  const { roomID } = useClientContext();

  const onViewSelectionChange = useCallback(
    async (selectedKey: Selection) => {
      if (!(selectedKey instanceof Set) || selectedKey.size === 0) return;

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      const currentKey: 'gallery' | 'speaker' = selectedKey.currentKey;

      await clientSDK.setMetadata(roomID, {
        currentLayout: currentKey,
        previousLayout: currentLayout,
      });
    },
    [roomID, currentLayout]
  );

  const selectedKeys =
    currentLayout !== 'presentation'
      ? new Set([currentLayout])
      : new Set([previousLayout]);

  return (
    <Dropdown className="min-w-40 ring-1 ring-zinc-800/70">
      <DropdownTrigger>
        <Button
          className={`h-auto min-h-0 min-w-0 gap-0 rounded-xl bg-zinc-700/70 px-2 py-1.5 text-xs font-medium antialiased hover:bg-zinc-600 active:bg-zinc-500 ${
            currentLayout === 'presentation'
              ? 'cursor-not-allowed'
              : 'cursor-auto'
          }`}
          isDisabled={currentLayout === 'presentation'}
          aria-disabled={currentLayout === 'presentation'}
          disabled={currentLayout === 'presentation'}
        >
          <span>
            <GridViewIcon className="h-5 w-5" />
          </span>
          <span className="ml-2 capitalize">
            {currentLayout !== 'presentation' ? currentLayout : previousLayout}{' '}
            View
          </span>
          <span className="ml-2">
            <ChevronDownIcon className="h-3 w-3" />
          </span>
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        disallowEmptySelection
        aria-label="Choose a view"
        selectionMode="single"
        selectedKeys={selectedKeys}
        onSelectionChange={onViewSelectionChange}
      >
        <DropdownItem
          key="speaker"
          className="py-1 text-zinc-400 hover:text-zinc-200"
          textValue="Speaker View"
        >
          <div className="flex items-center gap-1.5 text-xs font-medium">
            <span>
              <ThreeGridIcon className="h-6 w-6" />
            </span>
            <span>Speaker View</span>
          </div>
        </DropdownItem>
        <DropdownItem
          key="gallery"
          className="py-1 text-zinc-400 hover:text-zinc-200"
          textValue="Gallery View"
        >
          <div className="flex items-center gap-1.5 text-xs font-medium">
            <span>
              <FourGridIcon className="h-6 w-6" />
            </span>
            <span>Gallery View</span>
          </div>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}

function GridViewIcon(props: SVGElementPropsType) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="M6.25 12.5c-.69 0-1.25.56-1.25 1.25v2c0 .69.56 1.25 1.25 1.25h4c.69 0 1.25-.56 1.25-1.25v-2c0-.69-.56-1.25-1.25-1.25h-4Zm7.5 0c-.69 0-1.25.56-1.25 1.25v2c0 .69.56 1.25 1.25 1.25h4c.69 0 1.25-.56 1.25-1.25v-2c0-.69-.56-1.25-1.25-1.25h-4ZM6.25 7C5.56 7 5 7.56 5 8.25v2c0 .69.56 1.25 1.25 1.25h4c.69 0 1.25-.56 1.25-1.25v-2c0-.69-.56-1.25-1.25-1.25h-4Zm7.5 0c-.69 0-1.25.56-1.25 1.25v2c0 .69.56 1.25 1.25 1.25h4c.69 0 1.25-.56 1.25-1.25v-2C19 7.56 18.44 7 17.75 7h-4ZM2 6.75A2.75 2.75 0 0 1 4.75 4h14.5A2.75 2.75 0 0 1 22 6.75v10.5A2.75 2.75 0 0 1 19.25 20H4.75A2.75 2.75 0 0 1 2 17.25V6.75ZM4.75 5.5c-.69 0-1.25.56-1.25 1.25v10.5c0 .69.56 1.25 1.25 1.25h14.5c.69 0 1.25-.56 1.25-1.25V6.75c0-.69-.56-1.25-1.25-1.25H4.75Z"
      />
    </svg>
  );
}

function ChevronDownIcon(props: SVGElementPropsType) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" {...props}>
      <path
        fill="currentColor"
        d="M2.22 4.47a.75.75 0 0 1 1.06 0L6 7.19l2.72-2.72a.75.75 0 0 1 1.06 1.06L6.53 8.78a.75.75 0 0 1-1.06 0L2.22 5.53a.75.75 0 0 1 0-1.06Z"
      />
    </svg>
  );
}

function PeopleIcon(props: SVGElementPropsType) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="M16 17v2H2v-2s0-4 7-4s7 4 7 4m-3.5-9.5A3.5 3.5 0 1 0 9 11a3.5 3.5 0 0 0 3.5-3.5m3.44 5.5A5.32 5.32 0 0 1 18 17v2h4v-2s0-3.63-6.06-4M15 4a3.39 3.39 0 0 0-1.93.59a5 5 0 0 1 0 5.82A3.39 3.39 0 0 0 15 11a3.5 3.5 0 0 0 0-7Z"
      />
    </svg>
  );
}

function ThreeGridIcon(props: SVGElementPropsType) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" {...props}>
      <path
        fill="currentColor"
        d="M6 3a3 3 0 0 0-3 3v3.5h14V6a3 3 0 0 0-3-3zm11 7.5h-6.5V17H14a3 3 0 0 0 3-3zm-7.5 0H3V14a3 3 0 0 0 3 3h3.5z"
      />
    </svg>
  );
}

function FourGridIcon(props: SVGElementPropsType) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="M17.75 21h-5v-8.25H21v5A3.25 3.25 0 0 1 17.75 21M21 11.25h-8.25V3h5A3.25 3.25 0 0 1 21 6.25zm-9.75 0V3h-5A3.25 3.25 0 0 0 3 6.25v5zM3 12.75v5A3.25 3.25 0 0 0 6.25 21h5v-8.25z"
      />
    </svg>
  );
}

function ConnectionStatusOverlay() {
  const { connectionState } = usePeerContext();

  return (
    <div>
      <ReconnectModal />
      {connectionState === 'connecting' && (
        <div className="flex items-center">
          <CircularProgress
            classNames={{ svg: 'h-6 w-6' }}
            strokeWidth={4}
            aria-label="Connecting"
          />
          <span className="ml-1.5 hidden text-xs font-medium text-zinc-300 sm:inline-block">
            Connecting
          </span>
        </div>
      )}
      {connectionState === 'connected' && (
        <div className="flex items-center">
          <PlugConnectedFillIcon className="h-6 w-6 text-green-600" />
          <span className="ml-1.5 hidden text-xs font-medium text-zinc-300 sm:inline-block">
            Connected
          </span>
        </div>
      )}
      {connectionState === 'disconnected' && (
        <div className="flex items-center">
          <PlugDisconnectedFillIcon className="h-6 w-6 text-red-600/70" />
          <span className="ml-1.5 hidden text-xs font-medium text-zinc-300 sm:inline-block">
            Disconnected
          </span>
        </div>
      )}
    </div>
  );
}
