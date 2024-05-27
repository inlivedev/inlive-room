'use client';

import {
  type ParticipantVideo,
  useParticipantContext,
} from '@/_features/room/contexts/participant-context';
import { useMetadataContext } from '@/_features/room/contexts/metadata-context';
import SpotlightView from '@/_features/room/components/spotlight-view';
import MeetingPresentationLayout from '@/_features/room/components/meeting-presentation-layout';
import GalleryLayout from '@/_features/room/components/gallery-layout';
import WebinarSpeakerLayout from '@/_features/room/components/webinar-speaker-layout';
import WebinarPresentationLayout from '@/_features/room/components/webinar-presentation-layout';
import HiddenView from '@/_features/room/components/hidden-view';
import ConferenceNotification from '@/_features/room/components/conference-notification';

export default function ConferenceParticipants({
  roomType,
}: {
  roomType: string;
}) {
  const { streams } = useParticipantContext();

  //   const streams = orderBySpotlight(
  //   checkSpotlight(rawStreams, spotlightForEveryone)
  // );

  // const streams = orderByPin(rawStreams, pinnedStreams);

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
}

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

const orderByPin = (streams: ParticipantVideo[], pinnedStreams: string[]) => {
  return streams.sort((streamA, streamB) => {
    const indexA = pinnedStreams.indexOf(streamA.id);
    const indexB = pinnedStreams.indexOf(streamB.id);

    return (
      (indexA > -1 ? indexA : Infinity) - (indexB > -1 ? indexB : Infinity)
    );
  });
};

const checkSpotlight = (
  streams: ParticipantVideo[],
  spotlightForEveryone: string[]
) => {
  return streams.map((stream) => {
    if (spotlightForEveryone.includes(stream.id)) {
      stream.spotlightForEveryone = true;
    } else {
      stream.spotlightForEveryone = false;
    }
    return stream;
  });
};

const orderBySpotlight = (streams: ParticipantVideo[]) => {
  return streams.sort((streamA, streamB) => {
    return (
      Number(streamB.spotlightForMyself) - Number(streamA.spotlightForMyself) ||
      Number(streamB.spotlightForEveryone) -
        Number(streamA.spotlightForEveryone)
    );
  });
};
