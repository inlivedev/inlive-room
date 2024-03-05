import type { Metadata } from 'next';
import { cookies, headers } from 'next/headers';
import AppContainer from '@/_shared/components/containers/app-container';
import type { AuthType } from '@/_shared/types/auth';
import HTTPError from '@/_shared/components/errors/http-error';
import EventList from '@/_features/event/components/event-list';
import type { EventType } from '@/_shared/types/event';
import { InternalApiFetcher } from '@/_shared/utils/fetcher';
import { whitelistFeature } from '@/_shared/utils/flag';
import Header from '@/_shared/components/header/header';

const EVENT_FORM_URL =
  process.env.NEXT_PUBLIC_EVENT_FORM_URL || process.env.NEXT_PUBLIC_APP_ORIGIN;

export const generateMetadata = (): Metadata => {
  const headersList = headers();
  const userAuthHeader = headersList.get('user-auth');

  const user: AuthType.CurrentAuthData | null =
    typeof userAuthHeader === 'string'
      ? JSON.parse(userAuthHeader)
      : userAuthHeader;

  if (!user || !user.id) {
    return {
      title: `Login Required — inLive Room`,
      description: 'You need to be logged in to access this page',
    };
  }

  return {
    title: `My Events — inLive Room`,
  };
};

export default async function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const headersList = headers();
  const userAuthHeader = headersList.get('user-auth');

  const user: AuthType.CurrentAuthData | null =
    typeof userAuthHeader === 'string'
      ? JSON.parse(userAuthHeader)
      : userAuthHeader;

  if (!user) {
    return (
      <HTTPError
        title="Login Required"
        description="You need to be logged in to access this page"
      />
    );
  }

  const eligibleForEvent =
    whitelistFeature.includes('event') ||
    !!user?.whitelistFeature.includes('event');

  if (!eligibleForEvent) {
    return (
      <AppContainer user={user}>
        <HTTPError
          title="You are not eligible to see this page"
          description="Only early-access users can access this page."
        />
      </AppContainer>
    );
  }

  const page = searchParams['page'] ? parseInt(searchParams['page']) : 1;
  const limit = searchParams['limit'] ? parseInt(searchParams['limit']) : 10;

  const token = cookies().get('token')?.value ?? '';

  const eventResponse: EventType.ListEventsResponse =
    await InternalApiFetcher.get(`/api/events?page=${page}&limit=${limit}`, {
      headers: {
        Cookie: `token=${token}`,
      },
    });

  let isLimitReached = false;
  let eventCreateLimit: EventType.CreateLimit | undefined = undefined;

  if (!whitelistFeature.includes('event') === true) {
    eventCreateLimit = await InternalApiFetcher.get(`/api/events/can-create`, {
      headers: {
        Cookie: `token=${token}`,
      },
    });

    if (eventCreateLimit?.code === 403) {
      isLimitReached = true;
    }
  }

  const events = eventResponse.data || [];
  const pageMeta = eventResponse.meta;

  let validPagination = false;
  if (page <= pageMeta.total_page) {
    validPagination = true;
  }

  return (
    <AppContainer user={user}>
      <div className="bg-zinc-900">
        <div className="min-viewport-height mx-auto flex h-full w-full max-w-7xl flex-1 flex-col  px-4">
          <Header logoText="inLive Room" logoHref="/" />
          {TrialMessage()}
          <EventList
            events={events}
            pageMeta={pageMeta}
            validPagination={validPagination}
            limitCreate={isLimitReached}
          />
        </div>
      </div>
    </AppContainer>
  );

  function TrialMessage() {
    return (
      <div>
        {!whitelistFeature.includes('event') === true &&
          user &&
          user.whitelistFeature.includes('event') === false && (
            <p className="rounded-md bg-blue-950 p-2 text-center ring-1 ring-blue-800">
              You have a limit to publish only {eventCreateLimit?.data.limit}{' '}
              events during Beta [{eventCreateLimit?.data.count} of{' '}
              {eventCreateLimit?.data.limit}] left.
              <br />
              You can fill this{' '}
              <a className={'font-medium text-blue-300'} href={EVENT_FORM_URL}>
                form
              </a>{' '}
              to request an extended limit.
            </p>
          )}
      </div>
    );
  }
}
