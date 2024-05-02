import type { ParticipantVideo } from '@/_features/room/contexts/participant-context';
import ConferenceScreen from './conference-screen';

export default function HiddenView({
  streams,
}: {
  streams: ParticipantVideo[];
}) {
  return (
    <>
      {streams.map((stream) => (
        <ConferenceScreen key={`hidden-${stream.id}`} stream={stream} hidden />
      ))}
    </>
  );
}
