'use server';
import { cookies } from 'next/headers';
import { room } from '@/_shared/utils/sdk';

export const getHostCookie = () => {
  const cookieStore = cookies();
  const host = cookieStore.get('host');
  return !!host;
};

export const deleteHostCookie = async () => {
  const cookieStore = cookies();

  if (cookieStore.get('host')) {
    cookieStore.delete('host');
  }
};

export const setClientCookie = async (roomId: string) => {
  return new Promise<{ clientId: string; roomId: string }>(async (resolve) => {
    const cookiesStore = cookies();
    const clientIdCookie = cookiesStore.get('clientId');
    const roomIdCookie = cookiesStore.get('roomId');

    if (!clientIdCookie || !roomIdCookie || roomIdCookie.value !== roomId) {
      const data = await room
        .createClient(roomId)
        .then((response) => response.data);

      cookiesStore.set('clientId', data.clientId);
      cookiesStore.set('roomId', roomId);
      resolve({
        clientId: data.clientId,
        roomId: roomId,
      });
    } else {
      resolve({
        clientId: clientIdCookie.value,
        roomId: roomIdCookie.value,
      });
    }
  });
};
