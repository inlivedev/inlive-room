import type { Metadata } from 'next';
import { cookies, headers } from 'next/headers';
import { notFound } from 'next/navigation';
import AppContainer from '@/_shared/components/containers/app-container';
import EventDetail from '@/_features/event/components/event-detail';
import { InternalApiFetcher } from '@/_shared/utils/fetcher';
import type { AuthType } from '@/_shared/types/auth';
import type { EventType } from '@/_shared/types/event';

type PageProps = {
  params: {
    eventID: string;
  };
};

const APP_ORIGIN = process.env.NEXT_PUBLIC_APP_ORIGIN;

function sanitizeHTML(htmlString: string) {
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
  const cookie = (await cookies().get('token')?.value) ?? '';

  const { data: eventData }: EventType.DetailEventResponse =
    await InternalApiFetcher.get(`/api/events/${eventID}`, {
      headers: {
        Cookie: `token=${cookie}`,
      },
      cache: 'no-cache',
    });

  if (!eventData || !eventData.id) {
    return {
      title: 'Page Not Found',
      description: 'There is nothing to see on this page',
    };
  }

  const imageSrc = eventData.thumbnailUrl
    ? `${APP_ORIGIN}/static${eventData.thumbnailUrl}`
    : '/images/webinar/og-image-inlive-room-webinar-generic-en.png';
  const description = sanitizeHTML(eventData.description || '');
  const descriptionSummary = `${description.slice(0, 150) + '...'}`;

  return {
    title: `Webinar — ${eventData.name} — inLive Room`,
    description: descriptionSummary,
    openGraph: {
      title: `Webinar — ${eventData.name} — inLive Room`,
      description: descriptionSummary,
      url: `/events/${eventData.slug}`,
      images: [imageSrc],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Webinar — ${eventData.name} — inLive Room`,
      description: descriptionSummary,
      images: [imageSrc],
    },
  };
};

export default async function Page({ params: { eventID } }: PageProps) {
  const headersList = headers();
  const userAuthHeader = headersList.get('user-auth');

  const userAuth: AuthType.CurrentAuthData | null =
    typeof userAuthHeader === 'string'
      ? JSON.parse(userAuthHeader)
      : userAuthHeader;

  const cookie = cookies().get('token')?.value ?? '';

  const { data: eventData }: EventType.DetailEventResponse =
    await InternalApiFetcher.get(`/api/events/${eventID}`, {
      headers: {
        Cookie: `token=${cookie}`,
      },
      cache: 'no-cache',
    });

  if (!eventData || !eventData.id) {
    notFound();
  }

  const descriptionMarkup = {
    __html: eventData.description || '',
  };

  return (
    <AppContainer user={userAuth}>
      <EventDetail
        id={eventData.id}
        title={eventData.name}
        descriptionMarkup={descriptionMarkup}
        slug={eventData.slug}
        host={eventData.host}
        startTime={eventData.startTime}
        status={eventData.status}
        thumbnailUrl={eventData.thumbnailUrl}
        createdBy={eventData.createdBy}
        roomId={eventData.roomId || ''}
      />
    </AppContainer>
  );
}
