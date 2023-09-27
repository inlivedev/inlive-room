import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { room } from '@/_shared/utils/sdk';
import AppContainer from '@/_shared/components/containers/app-container';
import RoomContainer from '@/_features/room/components/container';
import View from '@/_features/room/components/view';
import { getOriginServerSide } from '@/_shared/utils/get-origin-server-side';
import { InternalApiFetcher } from '@/_shared/utils/fetcher';
import { RoomType } from '@/_shared/types/room';
import { getClientAuth } from '@/_shared/utils/get-client-auth';

type PageProps = {
  params: {
    roomId: string;
  };
};

export const generateMetadata = ({ params }: PageProps): Metadata => {
  return {
    title: `Room - ${params.roomId}`,
  };
};

export default async function Page({ params }: PageProps) {
  const response: RoomType.CreateJoinRoomResponse =
    await InternalApiFetcher.get(`/api/room/${params.roomId}/join`);

  const roomData = response.data;

  if (!roomData || !roomData.roomId) {
    notFound();
  }

  const currentAuth = await getClientAuth();
  const currentUser = currentAuth.data ? currentAuth.data : undefined;

  const {
    data: { clientId },
  } = await room.createClient(roomData.roomId);

  const origin = getOriginServerSide();

  return (
    <AppContainer currentUser={currentUser}>
      <RoomContainer roomId={roomData.roomId} clientId={clientId}>
        <View roomId={roomData.roomId} origin={origin} />
      </RoomContainer>
    </AppContainer>
  );
}
