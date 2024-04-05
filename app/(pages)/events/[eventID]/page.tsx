import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import AppContainer from '@/_shared/components/containers/app-container';
import EventDetail from '@/_features/event/components/event-detail';
import { eventService } from '@/(server)/api/_index';
import type { AuthType } from '@/_shared/types/auth';

type PageProps = {
  params: {
    eventID: string;
  };
  searchParams: { [key: string]: string };
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
  const event = await eventService.getEventBySlugOrID(eventID, undefined);

  if (!event || !event.id) {
    return {
      title: 'Page Not Found',
      description: 'There is nothing to see on this page',
    };
  }

  const imageSrc = event.thumbnailUrl
    ? `${APP_ORIGIN}/static${event.thumbnailUrl}`
    : '/images/webinar/og-image-inlive-room-webinar-generic-en.png';
  const description = sanitizeHTML(event.description || '');
  const descriptionSummary = `${description.slice(0, 150) + '...'}`;

  return {
    title: `Webinar — ${event.name} — inLive Room`,
    description: descriptionSummary,
    openGraph: {
      title: `Webinar — ${event.name} — inLive Room`,
      description: descriptionSummary,
      url: `/events/${event.slug}`,
      images: [imageSrc],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Webinar — ${event.name} — inLive Room`,
      description: descriptionSummary,
      images: [imageSrc],
    },
  };
};

export default async function Page({
  params: { eventID },
  searchParams,
}: PageProps) {
  const headersList = headers();
  const userAuthHeader = headersList.get('user-auth');

  const error = searchParams.error;

  const user: AuthType.CurrentAuthData | null =
    typeof userAuthHeader === 'string'
      ? JSON.parse(userAuthHeader)
      : userAuthHeader;

  const event = await eventService.getEventBySlugOrID(eventID, undefined);

  if (!event || event.status === 'draft') {
    return notFound();
  }

  return (
    <AppContainer user={user}>
      <EventDetail event={event} status="public" errorStatus={error} />
    </AppContainer>
  );
}
