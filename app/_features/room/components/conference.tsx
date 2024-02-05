'use client';

import ConferenceTopBar from '@/_features/room/components/conference-top-bar';
import ConferenceActionsBar from '@/_features/room/components/conference-actions-bar';
import { useParticipantContext } from '@/_features/room/contexts/participant-context';
import { useMetadataContext } from '@/_features/room/contexts/metadata-context';
import MeetingOneOnOneLayout from './meeting-one-on-one-layout';
import MeetingPresentationLayout from './meeting-presentation-layout';
import GalleryLayout from './gallery-layout';
import WebinarSpeakerLayout from './webinar-speaker-layout';
import WebinarPresentationLayout from './webinar-presentation-layout';

const WebinarRoomLayout = () => {
  const { streams } = useParticipantContext();
  const { currentLayout } = useMetadataContext();

  if (currentLayout === 'presentation') {
    return <WebinarPresentationLayout streams={streams} />;
  }

  if (currentLayout === 'speaker') {
    return <WebinarSpeakerLayout streams={streams} />;
  }

  return <GalleryLayout streams={streams} />;
};

const MeetingRoomLayout = () => {
  const { streams } = useParticipantContext();
  const { currentLayout } = useMetadataContext();

  if (currentLayout === 'presentation') {
    return <MeetingPresentationLayout streams={streams} />;
  }

  if (streams.length === 2 && currentLayout === 'gallery') {
    return <MeetingOneOnOneLayout streams={streams} />;
  }

  return <GalleryLayout streams={streams} />;
};

export default function Conference({ roomType }: { roomType: string }) {
  return (
    <>
      <div className="viewport-height grid grid-rows-[40px,1fr,72px] overflow-y-hidden">
        <ConferenceTopBar />
        <div className="px-4 pb-4">
          {roomType === 'event' ? <WebinarRoomLayout /> : <MeetingRoomLayout />}
        </div>
        <div>
          <ConferenceActionsBar />
        </div>
      </div>
    </>
  );
}
