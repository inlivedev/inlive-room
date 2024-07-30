'use client';

import { useEffect, useState } from 'react';
import ConferenceTopBar from '@/_features/room/components/conference-top-bar';
import ConferenceActionsBar from '@/_features/room/components/conference-actions-bar';
import {
  type ParticipantVideo,
  useParticipantContext,
} from '@/_features/room/contexts/participant-context';
import { useMetadataContext } from '@/_features/room/contexts/metadata-context';
import SpotlightView from './spotlight-view';
import MeetingPresentationLayout from './meeting-presentation-layout';
import GalleryLayout from './gallery-layout';
import HiddenView from './hidden-view';
import ConferenceNotification from './ conference-notification';
import ParticipantListMenu from './participant-list-sidebar';
import RightSidebar from './right-sidebar';

export type Sidebar = 'participants' | 'chat' | '';

export default function Conference() {
  const [sidebar, setSidebar] = useState<Sidebar>('');

  useEffect(() => {
    const openRightDrawer = ((event: CustomEventInit) => {
      setSidebar(event.detail?.menu || '');
    }) as EventListener;

    const closeRightDrawer = (() => setSidebar('')) as EventListener;

    document.addEventListener('open:right-drawer-menu', openRightDrawer);
    document.addEventListener('close:right-drawer-menu', closeRightDrawer);

    return () => {
      document.removeEventListener('open:right-drawer-menu', openRightDrawer);
      document.removeEventListener('close:right-drawer-menu', closeRightDrawer);
    };
  }, []);

  return (
    <div className="viewport-height grid grid-cols-[1fr,auto]">
      <div className="relative grid h-full grid-rows-[auto,1fr,72px] overflow-y-hidden">
        <ConferenceTopBar sidebar={sidebar} />
        <ConferenceParticipants sidebar={sidebar} />
        <ConferenceActionsBar />
      </div>
    </div>
  );
}

const ConferenceParticipants = ({ sidebar }: { sidebar: Sidebar }) => {
  const { streams } = useParticipantContext();
  const pinnedStream =
    streams[0]?.pin || streams[0]?.spotlight ? streams[0] : undefined;

  return (
    <div className="px-4">
      <div className="relative grid h-full w-full grid-cols-[auto,minmax(auto,max-content)]">
        <div className="grid grid-rows-[auto,1fr]">
          <div>
            {pinnedStream?.spotlight && pinnedStream?.origin === 'local' ? (
              <div className="mb-3">
                <ConferenceNotification
                  show={true}
                  text="You are currently being spotlighted. Your video is highlighted for everyone."
                />
              </div>
            ) : null}
          </div>
          <div>
            <ParticipantLayout streams={streams} pinnedStream={pinnedStream} />
          </div>
        </div>
        {sidebar ? (
          <div className="ml-4 w-[360px]">
            <RightSidebar isOpen={!!sidebar}>
              {sidebar === 'participants' ? <ParticipantListMenu /> : null}
            </RightSidebar>
          </div>
        ) : null}
      </div>
    </div>
  );
};

const ParticipantLayout = ({
  streams,
  pinnedStream,
}: {
  streams: ParticipantVideo[];
  pinnedStream: ParticipantVideo | undefined;
}) => {
  const { currentLayout } = useMetadataContext();

  if (pinnedStream) {
    const hiddenStreams = streams.slice(1);

    if (pinnedStream.origin === 'local') {
      return (
        <>
          <SpotlightView streamA={pinnedStream} />
          <HiddenView streams={hiddenStreams} />
        </>
      );
    }

    const localStreamIndex = hiddenStreams.findIndex((stream) => {
      return stream.origin === 'local' && stream.source === 'media';
    });

    const localStream = hiddenStreams.splice(localStreamIndex, 1)[0];

    return (
      <>
        <SpotlightView streamA={pinnedStream} streamB={localStream} />
        <HiddenView streams={hiddenStreams} />
      </>
    );
  }

  if (streams.length === 2 && currentLayout === 'gallery') {
    const localStream = streams.find((stream) => stream.origin === 'local');
    const remoteStream = streams.find((stream) => stream.origin === 'remote');

    if (remoteStream && localStream) {
      return <SpotlightView streamA={remoteStream} streamB={localStream} />;
    }
  }

  if (currentLayout === 'presentation') {
    return <MeetingPresentationLayout streams={streams} />;
  }

  return <GalleryLayout streams={streams} />;
};
