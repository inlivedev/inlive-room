'use client';

import { Button, CircularProgress } from "@heroui/react";
import { usePeerContext } from '@/_features/room/contexts/peer-context';
import PlugConnectedFillIcon from '@/_shared/components/icons/plug-connected-fill-icon';
import PlugDisconnectedFillIcon from '@/_shared/components/icons/plug-disconnected-fill-icon';
import ReconnectModal from '@/_features/room/components/reconnect-modal';

import type { SVGElementPropsType } from '@/_shared/types/types';
import type { Sidebar, ParticipantVideo } from './conference';
import ButtonLayout from './button-layout';
import GalleryPagination from './gallery-pagination';

export default function ConferenceTopBar({
  streams,
  sidebar,
  activeLayout,
  pageSize,
  page,
  setPage,
}: {
  streams: ParticipantVideo[];
  sidebar: Sidebar;
  activeLayout: string;
  pageSize: number;
  page: number;
  setPage: (page: number) => void;
}) {
  const participants = streams.filter((stream) => stream.source === 'media');
  const needPagination =
    activeLayout === 'gallery' && Math.ceil(streams.length / pageSize) > 1;

  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center">
        <ConnectionStatusOverlay></ConnectionStatusOverlay>
      </div>
      <div className="flex items-center gap-2">
        {needPagination && (
          <GalleryPagination
            totalItems={streams.length}
            streamPerPage={pageSize}
            page={page}
            onChange={setPage}
          />
        )}
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <ButtonLayout />
        <Button
          className="h-auto min-h-0 min-w-0 gap-2 rounded-xl bg-zinc-700/70 px-2 py-1.5 text-xs font-medium tabular-nums antialiased hover:bg-zinc-600 active:bg-zinc-500"
          onClick={() => {
            if (sidebar === 'participants') {
              document.dispatchEvent(
                new CustomEvent('close:right-sidebar', {
                  detail: { menu: 'participants' },
                })
              );
            } else {
              document.dispatchEvent(
                new CustomEvent('open:right-sidebar', {
                  detail: { menu: 'participants' },
                })
              );
            }
          }}
        >
          <PeopleIcon className="h-5 w-5" />
          <span>{participants.length}</span>
        </Button>
      </div>
    </div>
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
