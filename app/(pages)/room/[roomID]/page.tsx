import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import AppContainer from '@/_shared/components/containers/app-container';
import View from '@/_features/room/components/view';
import type { RoomType } from '@/_shared/types/room';
import type { UserType } from '@/_shared/types/user';
import type { ClientType } from '@/_shared/types/client';
import { room } from '@/_shared/utils/sdk';

type PageProps = {
  params: {
    roomID: string;
  };
};

export const generateMetadata = ({ params }: PageProps): Metadata => {
  return {
    title: `Room - ${params.roomID}`,
  };
};

export default async function Page() {
  const headersList = headers();
  const roomDataHeader = headersList.get('room-data');
  const userAuthHeader = headersList.get('user-auth');
  const userClientHeader = headersList.get('user-client');

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
    await room.setMetadata(roomData.id, {
      host: {
        clientID: userClient.clientID,
      },
    });
  }

  return (
    <AppContainer user={userAuth}>
      <View
        roomID={roomData.id}
        client={userClient}
        isModerator={isModerator}
      />
    </AppContainer>
  );
}
