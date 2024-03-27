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

export const generateMetadata = (): Metadata | null => {
  const headersList = headers();
  const roomDataHeader = headersList.get('room-data');
  const roomData: RoomType.RoomData | null =
    typeof roomDataHeader === 'string'
      ? JSON.parse(roomDataHeader)
      : roomDataHeader;

  if (!roomData || !roomData.id) return null;

  const type = roomData.meta?.type === 'event' ? 'Webinar' : 'Meeting';
  const description =
    'Experience real-time messaging, video, and audio for seamless collaboration, all within inLive Room.';
  const ogImage = '/images/general-og.png';

  return {
    title: `${type} Room: ${roomData.id} — inLive Room`,
    description: description,
    openGraph: {
      title: `Join the ${type.toLocaleLowerCase()} room — inLive Room`,
      description: description,
      url: `/rooms/${roomData.id}`,
      images: [ogImage],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Join the ${type.toLocaleLowerCase()} room — inLive Room`,
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

  await Promise.allSettled([setModeratorMetaPromise()]).then((results) => {
    return results.map((result) => {
      if (result.status === 'fulfilled') return result.value;
      return null;
    });
  });

  const roomType = roomData.meta ? roomData.meta.type : 'meeting';

  return (
    <AppContainer user={userAuth}>
      <View
        roomID={roomData.id}
        client={userClient}
        roomType={roomType}
        isModerator={isModerator}
        debug={debug}
      />
    </AppContainer>
  );
}
