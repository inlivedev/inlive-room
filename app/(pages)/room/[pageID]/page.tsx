import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import AppContainer from '@/_shared/components/containers/app-container';
import RoomContainer from '@/_features/room/components/container';
import View from '@/_features/room/components/view';
import { getOriginServerSide } from '@/_shared/utils/get-origin-server-side';
import { InternalApiFetcher } from '@/_shared/utils/fetcher';
import { RoomType } from '@/_shared/types/room';
import { getClientAuth } from '@/_shared/utils/get-client-auth';
import { room } from '@/_shared/utils/sdk';

type PageProps = {
  params: {
    pageID: string;
  };
};

export const generateMetadata = ({ params }: PageProps): Metadata => {
  return {
    title: `Room - ${params.pageID}`,
  };
};

export default async function Page({ params }: PageProps) {
  const roomResp: RoomType.CreateJoinRoomResponse =
    await InternalApiFetcher.get(`/api/room/${params.pageID}/join`, {
      cache: 'no-cache',
    });

  const roomData = roomResp.data;

  if (!roomData || !roomData.externalID || !roomData.id) {
    notFound();
  }

  const currentAuth = await getClientAuth();
  const currentUser = currentAuth.data ? currentAuth.data : undefined;

  const {
    data: { clientId },
  } = await room.createClient(roomData.externalID);

  const origin = getOriginServerSide();

  return (
    <AppContainer currentUser={currentUser}>
      <RoomContainer
        pageId={roomData.id}
        roomId={roomData.externalID}
        clientId={clientId}
      >
        <View
          pageId={roomData.id}
          roomId={roomData.externalID}
          origin={origin}
        />
      </RoomContainer>
    </AppContainer>
  );
}
