import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import AppContainer from '@/_shared/components/containers/app-container';
import View from '@/_features/room/components/view';
import type { RoomType } from '@/_shared/types/room';
import type { UserType } from '@/_shared/types/user';
import type { ClientType } from '@/_shared/types/client';

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

  const roomData: RoomType.RoomData = JSON.parse(roomDataHeader || '');
  const userAuth: UserType.AuthUserData = JSON.parse(userAuthHeader || '');
  const userClient: ClientType.ClientData = JSON.parse(userClientHeader || '');

  if (!roomData || !roomData.id) {
    notFound();
  }

  return (
    <AppContainer user={userAuth}>
      <View roomID={roomData.id} client={userClient} />
    </AppContainer>
  );
}
