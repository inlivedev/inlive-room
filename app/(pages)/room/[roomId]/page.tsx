import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Layout from '@/_features/room/layout/layout';
import { room } from '@/_shared/utils/sdk';
import { getOriginServerSide } from '@/_shared/utils/get-origin-server-side';
import { cookies } from 'next/headers';
import CookieContainer from '@/_features/room/containers/cookie-container';

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

const getHostCookie = () => {
  const cookieStore = cookies();
  const host = cookieStore.get('host');
  return !!host;
};

export default async function Page({ params: { roomId } }: PageProps) {
  const response = await room.getRoom(roomId);

  if (!response.data.roomId) {
    notFound();
  }

  return (
    <CookieContainer>
      <Layout
        roomId={response.data.roomId}
        host={getHostCookie()}
        origin={getOriginServerSide()}
      />
    </CookieContainer>
  );
}
