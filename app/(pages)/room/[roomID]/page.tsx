import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import AppContainer from '@/_shared/components/containers/app-container';
import View from '@/_features/room/components/view';
import type { RoomType } from '@/_shared/types/room';
import type { UserType } from '@/_shared/types/user';
import type { ClientType } from '@/_shared/types/client';
import { clientSDK } from '@/_shared/utils/sdk';

type PageProps = {
  params: {
    roomID: string;
  };
  searchParams: { debug: string | undefined };
};

export const generateMetadata = ({ params }: PageProps): Metadata => {
  return {
    title: `Room - ${params.roomID}`,
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
  const userAuth: UserType.AuthUserData | null =
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

  if (isModerator) {
    const moderatorMeta = await clientSDK.getMetadata(
      roomData.id,
      'moderatorIDs'
    );
    const moderatorIDs = moderatorMeta?.data?.moderatorIDs;

    if (Array.isArray(moderatorIDs)) {
      await clientSDK.setMetadata(roomData.id, {
        moderatorIDs: [...moderatorIDs, userClient.clientID],
      });
    } else {
      await clientSDK.setMetadata(roomData.id, {
        moderatorIDs: [userClient.clientID],
      });
    }
  }

  const roomType = roomData.meta ? roomData.meta.type : 'meeting' || 'meeting';

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
