import { useState } from 'react';
import ConferenceActionsBar from '@/_features/room/components/conference-actions-bar';
import { useParticipantContext } from '@/_features/room/contexts/participant-context';
import ConferenceSpeakerLayout from './conference-speaker-layout';
import ConferencePresentationLayout from './conference-presentation-layout';
import { useMetadataContext } from '@/_features/room/contexts/metadata-context';

export default function Conference({ isModerator }: { isModerator: boolean }) {
  const { host, speakers: speakerClientIDs } = useMetadataContext();
  const { streams } = useParticipantContext();
  const [layout, setLayout] = useState<'speaker' | 'presentation'>('speaker');

  const speakers = streams.filter((stream) => {
    return (
      (host.clientIDs.includes(stream.clientId) && stream.source === 'media') ||
      (speakerClientIDs.includes(stream.clientId) && stream.source === 'media')
    );
  });

  const participants = streams.filter((stream) => {
    return (
      !host.clientIDs.includes(stream.clientId) &&
      !speakerClientIDs.includes(stream.clientId) &&
      stream.source === 'media'
    );
  });

  return (
    <div className="viewport-height grid grid-rows-[1fr,80px] overflow-y-hidden">
      <div>
        <ConferenceSpeakerLayout
          isModerator={isModerator}
          speakers={speakers}
          participants={participants}
        />
        {layout === 'speaker' ? (
          <ConferenceSpeakerLayout
            isModerator={isModerator}
            speakers={speakers}
            participants={participants}
          />
        ) : layout === 'presentation' ? (
          <ConferencePresentationLayout />
        ) : null}
      </div>
      <div>
        <ConferenceActionsBar isModerator={isModerator} />
      </div>
    </div>
  );
}
