import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import * as Sentry from '@sentry/nextjs';
import AppContainer from '@/_shared/components/containers/app-container';
import View from '@/_features/room/components/view';
import type { RoomType } from '@/_shared/types/room';
import type { AuthType } from '@/_shared/types/auth';
import type { ClientType } from '@/_shared/types/client';
import { serverSDK } from '@/(server)/_shared/utils/sdk';

type PageProps = {
  searchParams: { debug: string | undefined };
};

const APP_ORIGIN = process.env.NEXT_PUBLIC_APP_ORIGIN;

export const generateMetadata = (): Metadata => {
  const headersList = headers();
  const roomDataHeader = headersList.get('room-data');
  const roomData: RoomType.RoomData | null =
    typeof roomDataHeader === 'string'
      ? JSON.parse(roomDataHeader)
      : roomDataHeader;

  let title = '404 Room Not Found - inLive Room';
  let description = 'There is nothing to see on this page.';
  const ogImage = `${APP_ORIGIN}/images/general-og.png`;

  if (!roomData || !roomData.id) {
    return {
      title: title,
      description: description,
      openGraph: {
        title: title,
        description: description,
        url: `${APP_ORIGIN}`,
        images: [ogImage],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: title,
        description: description,
        images: [ogImage],
      },
    };
  }

  const type = roomData.meta?.type === 'event' ? 'Webinar' : 'Meeting';
  title = `${type} Room — inLive Room`;
  description = `Host or join in seconds. It's that simple! Experience real-time messaging, video, and audio for seamless collaboration, all within open-source virtual rooms.`;

  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      url: `${APP_ORIGIN}`,
      images: [ogImage],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description,
      images: [ogImage],
    },
  };
};

export default async function Page({ searchParams }: PageProps) {
  const headersList = headers();
  const roomDataHeader = headersList.get('room-data');
  const userAuthHeader = headersList.get('user-auth');
  const userClientHeader = headersList.get('user-client');
  const debug = searchParams.debug === 'true';

  const roomData: RoomType.RoomData | null =
    typeof roomDataHeader === 'string'
      ? JSON.parse(roomDataHeader)
      : roomDataHeader;
  const userAuth: AuthType.CurrentAuthData | null =
    typeof userAuthHeader === 'string'
      ? JSON.parse(userAuthHeader)
      : userAuthHeader;
  const userClient: ClientType.ClientData =
    typeof userClientHeader === 'string'
      ? JSON.parse(userClientHeader)
      : userClientHeader;

  if (!roomData || !roomData.id) {
    notFound();
  }

  const isModerator = roomData.createdBy === userAuth?.id;

  const setModeratorMetaPromise = async () => {
    if (isModerator) {
      const moderatorMeta = await serverSDK.getMetadata(
        roomData.id,
        'moderatorClientIDs'
      );
      const moderatorClientIDs = moderatorMeta?.data?.moderatorClientIDs;

      try {
        if (Array.isArray(moderatorClientIDs)) {
          await serverSDK.setMetadata(roomData.id, {
            moderatorClientIDs: [...moderatorClientIDs, userClient.clientID],
          });
        } else {
          await serverSDK.setMetadata(roomData.id, {
            moderatorClientIDs: [userClient.clientID],
          });
        }
      } catch (error) {
        Sentry.captureException(error, {
          extra: {
            message: `API call error when trying to add client ID to metadata moderatorClientIDs`,
            moderatorClientIDs: moderatorClientIDs,
            clientID: userClient.clientID,
          },
        });
        console.error(error);
      }
    }
  };

  const hubRoomPromise = serverSDK.getRoom(roomData.id);

  const [hubRoomResponse] = await Promise.allSettled([
    hubRoomPromise,
    setModeratorMetaPromise(),
  ]).then((results) => {
    return results.map((result) => {
      if (result.status === 'fulfilled') return result.value;
      return null;
    });
  });

  const codecPreferences = hubRoomResponse?.data?.codecPreferences || [];
  const bitrateConfig = {
    highBitrate: hubRoomResponse?.data?.bitrates.videoHigh || 0,
    midBitrate: hubRoomResponse?.data?.bitrates.videoMid || 0,
    lowBitrate: hubRoomResponse?.data?.bitrates.videoLow || 0,
  };
  const roomType = roomData.meta ? roomData.meta.type : 'meeting';

  return (
    <AppContainer user={userAuth}>
      <View
        roomID={roomData.id}
        client={userClient}
        roomType={roomType}
        isModerator={isModerator}
        debug={debug}
        codecPreferences={codecPreferences}
        bitrateConfig={bitrateConfig}
      />
    </AppContainer>
  );
}
