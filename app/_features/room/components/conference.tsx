'use client';

import { useEffect, useState } from 'react';
import { useDisclosure } from '@nextui-org/react';
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
import WebinarSpeakerLayout from './webinar-speaker-layout';
import WebinarPresentationLayout from './webinar-presentation-layout';
import HiddenView from './hidden-view';
import ConferenceNotification from './conference-notification';
import ParticipantListMenu from './participant-list-menu';
import RightDrawerMenu from './right-drawer-menu';

export default function Conference({ roomType }: { roomType: string }) {
  return (
    <div className="viewport-height grid grid-cols-[1fr,auto]">
      <div className="relative grid h-full grid-rows-[auto,auto,1fr,72px] overflow-y-hidden">
        <ConferenceTopBar />
        <ParticipantView roomType={roomType} />
        <div>
          <ConferenceActionsBar />
        </div>
      </div>
      <RightDrawerMenuContainer />
    </div>
  );
}

const RightDrawerMenuContainer = () => {
  type Menu = 'participants' | 'chat' | '';
  const [menu, setMenu] = useState<Menu>('');
  const { isOpen, onOpenChange, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const openRightDrawerMenu = ((event: CustomEventInit) => {
      const { menu } = event.detail || {};
      setMenu(menu);
      onOpen();
    }) as EventListener;

    const closeRightDrawerMenu = (() => {
      setMenu('');
      onClose();
    }) as EventListener;

    document.addEventListener('open:right-drawer-menu', openRightDrawerMenu);
    document.addEventListener('close:right-drawer-menu', closeRightDrawerMenu);

    return () => {
      document.removeEventListener(
        'open:right-drawer-menu',
        openRightDrawerMenu
      );
      document.removeEventListener(
        'close:right-drawer-menu',
        closeRightDrawerMenu
      );
    };
  }, [onOpen, onClose]);

  return (
    <RightDrawerMenu isOpen={isOpen} onOpenChange={onOpenChange}>
      {menu === 'participants' ? <ParticipantListMenu /> : null}
    </RightDrawerMenu>
  );
};

const ParticipantView = ({ roomType }: { roomType: string }) => {
  const { streams } = useParticipantContext();
  const spotlightedStream =
    streams[0]?.spotlightForMyself || streams[0]?.spotlightForEveryone
      ? streams[0]
      : undefined;

  return (
    <>
      <div className="px-4">
        {spotlightedStream?.spotlightForEveryone &&
        spotlightedStream?.origin === 'local' ? (
          <ConferenceNotification
            show={true}
            text="You are currently being spotlighted. Your video is highlighted for everyone."
          />
        ) : null}
      </div>
      <div className="mt-3 px-4 pb-4">
        {roomType === 'event' ? (
          <WebinarView
            streams={streams}
            spotlightedStream={spotlightedStream}
          />
        ) : (
          <MeetingView
            streams={streams}
            spotlightedStream={spotlightedStream}
          />
        )}
      </div>
    </>
  );
};

const MeetingView = ({
  streams,
  spotlightedStream,
}: {
  streams: ParticipantVideo[];
  spotlightedStream: ParticipantVideo | undefined;
}) => {
  const { currentLayout } = useMetadataContext();

  if (spotlightedStream) {
    const hiddenStreams = streams.slice(1);

    if (spotlightedStream.origin === 'local') {
      return (
        <>
          <SpotlightView streamA={spotlightedStream} />
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
        <SpotlightView streamA={spotlightedStream} streamB={localStream} />
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

const WebinarView = ({
  streams,
  spotlightedStream,
}: {
  streams: ParticipantVideo[];
  spotlightedStream: ParticipantVideo | undefined;
}) => {
  const { currentLayout } = useMetadataContext();

  if (spotlightedStream) {
    const hiddenStreams = streams.slice(1);

    if (spotlightedStream.origin === 'local') {
      return (
        <>
          <SpotlightView streamA={spotlightedStream} />
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
        <SpotlightView streamA={spotlightedStream} streamB={localStream} />
        <HiddenView streams={hiddenStreams} />
      </>
    );
  }

  if (currentLayout === 'presentation') {
    return <WebinarPresentationLayout streams={streams} />;
  }

  if (currentLayout === 'speaker') {
    return <WebinarSpeakerLayout streams={streams} />;
  }

  return <GalleryLayout streams={streams} />;
};
