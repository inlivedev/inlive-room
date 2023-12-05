import { useState } from 'react';
import ConferenceActionsBar from '@/_features/room/components/conference-actions-bar';
import { useParticipantContext } from '@/_features/room/contexts/participant-context';
import ConferenceSpeakerLayout from './conference-speaker-layout';
import ConferencePresentationLayout from './conference-presentation-layout';

export default function Conference({ isModerator }: { isModerator: boolean }) {
  const { streams } = useParticipantContext();
  const [layout, setLayout] = useState<'speaker' | 'presentation'>('speaker');

  return (
    <div className="viewport-height grid grid-rows-[1fr,80px] overflow-y-hidden">
      <div>
        {layout === 'speaker' ? (
          <ConferenceSpeakerLayout
            isModerator={isModerator}
            streams={streams}
          />
        ) : layout === 'presentation' ? (
          <ConferencePresentationLayout
            isModerator={isModerator}
            streams={streams}
          />
        ) : null}
      </div>
      <div>
        <ConferenceActionsBar isModerator={isModerator} />
      </div>
    </div>
  );
}
