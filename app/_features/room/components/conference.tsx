import ConferenceActionsBar from '@/_features/room/components/conference-actions-bar';
import {
  useParticipantContext,
  type ParticipantStream,
} from '@/_features/room/contexts/participant-context';
import ConferenceSpeakerLayout from './conference-speaker-layout';
import ConferencePresentationLayout from './conference-presentation-layout';

export default function Conference({ isModerator }: { isModerator: boolean }) {
  const { streams } = useParticipantContext();

  const { medias, screens } = streams.reduce(
    (accumulator, currentValue) => {
      if (currentValue.source === 'screen') {
        return {
          ...accumulator,
          screens: [...accumulator.screens, currentValue],
        };
      } else {
        return {
          ...accumulator,
          medias: [...accumulator.medias, currentValue],
        };
      }
    },
    { medias: [] as ParticipantStream[], screens: [] as ParticipantStream[] }
  );

  // need to be able to switch with other layouts later
  const layout: 'presentation' | 'speaker' =
    screens.length > 0 ? 'presentation' : 'speaker';

  return (
    <div className="viewport-height grid grid-rows-[1fr,80px] overflow-y-hidden">
      <div>
        {layout === 'speaker' ? (
          <ConferenceSpeakerLayout isModerator={isModerator} medias={medias} />
        ) : layout === 'presentation' ? (
          <ConferencePresentationLayout
            isModerator={isModerator}
            medias={streams}
            screens={screens}
          />
        ) : null}
      </div>
      <div>
        <ConferenceActionsBar isModerator={isModerator} />
      </div>
    </div>
  );
}
