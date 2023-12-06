import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import AppContainer from '@/_shared/components/containers/app-container';
import EventDetail from '@/_features/event/components/event-detail';
import { InternalApiFetcher } from '@/_shared/utils/fetcher';
import type { UserType } from '@/_shared/types/user';
import type { EventType } from '@/_shared/types/event';

const APP_ORIGIN = process.env.NEXT_PUBLIC_APP_ORIGIN;

type PageProps = {
  params: {
    eventID: string;
  };
};

const extractSrcImage = (htmlString: string) => {
  let src = '';

  const imgStartIndex = htmlString.indexOf('<img');
  const imgEndIndex = htmlString.indexOf('>', imgStartIndex) + 1;
  const imgTag = htmlString.slice(imgStartIndex, imgEndIndex);

  const srcIndex = imgTag.indexOf('src=');

  if (srcIndex !== -1) {
    const valueStartIndex = htmlString.indexOf('"', srcIndex) + 1;
    const valueEndIndex = htmlString.indexOf('"', valueStartIndex);
    src = htmlString.slice(valueStartIndex, valueEndIndex);
  }

  return src;
};

export function sanitizeHTML(htmlString: string) {
  let sanitizedString = '';
  let insideTag = false;

  for (let i = 0; i < htmlString.length; i++) {
    if (htmlString[i] === '<') {
      insideTag = true;
    } else if (htmlString[i] === '>') {
      insideTag = false;
    } else if (!insideTag) {
      if (htmlString[i] === '\n') {
        sanitizedString += ' ';
      } else {
        sanitizedString += htmlString[i];
      }
    }
  }

  return sanitizedString.trim();
}

export const generateMetadata = async ({
  params: { eventID },
}: PageProps): Promise<Metadata> => {
  const { data: eventData }: EventType.DetailEventResponse =
    await InternalApiFetcher.get(`/api/events/${eventID}`);

  if (!eventData || !eventData.id) {
    return {
      title: 'Page Not Found',
      description: 'There is nothing to see on this page',
    };
  }

  const eventStartDate = new Date(eventData.startTime).toLocaleDateString(
    'en-GB',
    {
      timeZone: 'Asia/Jakarta',
      month: 'long',
      day: '2-digit',
      year: 'numeric',
    }
  );

  const eventStartTime = new Date(eventData.startTime).toLocaleTimeString(
    'en-GB',
    {
      timeZone: 'Asia/Jakarta',
      minute: '2-digit',
      hour: '2-digit',
      hour12: true,
    }
  );

  const imageSrc = extractSrcImage(eventData.description || '');
  const description = sanitizeHTML(eventData.description || '');
  const descriptionSummary = `${eventStartDate} at ${eventStartTime}, ${description.slice(
    0,
    150
  )}`;

  return {
    title: `Webinar — ${eventData.name}`,
    description: descriptionSummary,
    openGraph: {
      title: `Webinar — ${eventData.name}`,
      description: descriptionSummary,
      url: `${APP_ORIGIN}/event/${eventData.slug}`,
      images: [imageSrc],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Webinar — ${eventData.name}`,
      description: descriptionSummary,
      images: [imageSrc],
    },
  };
};

export default async function Page({ params: { eventID } }: PageProps) {
  const headersList = headers();
  const userAuthHeader = headersList.get('user-auth');

  const userAuth: UserType.AuthUserData | null =
    typeof userAuthHeader === 'string'
      ? JSON.parse(userAuthHeader)
      : userAuthHeader;

  const { data: eventData }: EventType.DetailEventResponse =
    await InternalApiFetcher.get(`/api/events/${eventID}`);

  if (!eventData || !eventData.id) {
    notFound();
  }

  const descriptionMarkup = {
    __html: eventData.description || '',
  };

  return (
    <AppContainer user={userAuth}>
      <EventDetail
        title={eventData.name}
        descriptionMarkup={descriptionMarkup}
        slug={eventData.slug}
        host={eventData.host}
        startTime={eventData.startTime}
      />
    </AppContainer>
  );
}
