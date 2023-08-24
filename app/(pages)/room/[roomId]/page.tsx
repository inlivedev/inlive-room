import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Layout from '@/_features/room/layout/layout';
import { room } from '@/_shared/utils/sdk';
import { getOriginServerSide } from '@/_shared/utils/get-origin-server-side';
import { cookies } from 'next/headers';

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

const deleteHostCookie = async () => {
  'use server';
  const cookieStore = cookies();

  if (cookieStore.get('host')) {
    cookieStore.delete('host');
  }
};

export default async function Page({ params: { roomId } }: PageProps) {
  const response = await room.getRoom(roomId);

  if (!response.data.roomId) {
    notFound();
  }

  return (
    <Layout
      roomId={response.data.roomId}
      host={getHostCookie()}
      deleteHostCookie={deleteHostCookie}
      origin={getOriginServerSide()}
    />
  );
}
