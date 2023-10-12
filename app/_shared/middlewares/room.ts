import type { NextFetchEvent, NextMiddleware, NextRequest } from 'next/server';
import { InternalApiFetcher } from '@/_shared/utils/fetcher';
import type { RoomType } from '@/_shared/types/room';
import type { UserType } from '@/_shared/types/user';
import type { ClientType } from '@/_shared/types/client';
import { uniqueNamesGenerator, names } from 'unique-names-generator';

const registerClient = async (roomID: string, clientName: string) => {
  try {
    const response: RoomType.CreateClientResponse =
      await InternalApiFetcher.post(`/api/room/${roomID}/register`, {
        body: JSON.stringify({
          name: clientName,
        }),
      });

    const data = response.data || {};

    const client: ClientType.ClientData = {
      clientID: data.clientID,
      clientName: data.name,
    };

    return client;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const getClientName = (
  request: NextRequest,
  response: Awaited<ReturnType<NextMiddleware>>
) => {
  if (!response) return '';

  const clientName = request.cookies.get('client_name')?.value || '';

  if (clientName) return clientName;

  const userAuthHeader = response.headers.get('user-auth');
  const user: UserType.AuthUserData | null =
    typeof userAuthHeader === 'string'
      ? JSON.parse(userAuthHeader)
      : userAuthHeader;

  if (user) return user.name;

  return '';
};

const generateName = (name = '') => {
  if (name) return name;

  return uniqueNamesGenerator({
    dictionaries: [names, names],
    separator: ' ',
    length: 2,
  });
};

export function withRoomMiddleware(middleware: NextMiddleware) {
  return async (request: NextRequest, event: NextFetchEvent) => {
    const response = await middleware(request, event);
    const splitPath = request.nextUrl.pathname.split('/');

    if (response && splitPath[1] === 'room' && splitPath.length === 3) {
      const roomID = splitPath[2];

      const roomResponse: RoomType.CreateJoinRoomResponse =
        await InternalApiFetcher.get(`/api/room/${roomID}/join`, {
          cache: 'no-cache',
        });

      const roomData = roomResponse.data ? roomResponse.data : null;

      let client: ClientType.ClientData = {
        clientID: '',
        clientName: '',
      };

      if (roomData) {
        const clientName = getClientName(request, response);
        const newName = generateName(clientName);
        client = await registerClient(roomID, newName);
      }

      response.headers.set(
        'Set-Cookie',
        `client_name=${client.clientName};path=${request.nextUrl.pathname};SameSite=lax;`
      );
      response.headers.set('user-client', JSON.stringify(client));
      response.headers.set('room-data', JSON.stringify(roomData));
    }

    return response;
  };
}
