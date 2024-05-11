'use client';

import ConferenceTopBar from '@/_features/room/components/conference-top-bar';
import ConferenceActionsBar from '@/_features/room/components/conference-actions-bar';
import { useParticipantContext } from '@/_features/room/contexts/participant-context';
import { useMetadataContext } from '@/_features/room/contexts/metadata-context';
import SpotlightView from './spotlight-view';
import MeetingPresentationLayout from './meeting-presentation-layout';
import GalleryLayout from './gallery-layout';
import WebinarSpeakerLayout from './webinar-speaker-layout';
import WebinarPresentationLayout from './webinar-presentation-layout';
import HiddenView from './hidden-view';
import ConferenceNotification from './ conference-notification';

export default function Conference({ roomType }: { roomType: string }) {
  return (
    <>
      <div className="viewport-height grid grid-rows-[40px,1fr,72px] overflow-y-hidden">
        <ConferenceTopBar />
        <div className="px-4 pb-4">
          {roomType === 'event' ? <WebinarView /> : <MeetingView />}
        </div>
        <div>
          <ConferenceActionsBar />
        </div>
      </div>
    </>
  );
}

const MeetingView = () => {
  const { streams } = useParticipantContext();
  const { currentLayout } = useMetadataContext();
  const pinnedStream =
    streams[0]?.pin || streams[0]?.spotlight ? streams[0] : undefined;

  if (pinnedStream) {
    const hiddenStreams = streams.slice(1);

    if (pinnedStream.origin === 'local') {
      return (
        <>
          {pinnedStream.spotlight ? (
            <ConferenceNotification
              show={true}
              text="You are currently being spotlighted. Your video is highlighted for everyone."
            />
          ) : null}
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

const WebinarView = () => {
  const { streams } = useParticipantContext();
  const { currentLayout } = useMetadataContext();
  const pinnedStream =
    streams[0]?.pin || streams[0]?.spotlight ? streams[0] : undefined;

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

  if (currentLayout === 'presentation') {
    return <WebinarPresentationLayout streams={streams} />;
  }

  if (currentLayout === 'speaker') {
    return <WebinarSpeakerLayout streams={streams} />;
  }

  return <GalleryLayout streams={streams} />;
};
