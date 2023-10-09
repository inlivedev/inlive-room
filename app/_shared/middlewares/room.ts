import type { NextFetchEvent, NextMiddleware, NextRequest } from 'next/server';
import { InternalApiFetcher } from '@/_shared/utils/fetcher';
import { cookies } from 'next/headers';
import type { RoomType } from '@/_shared/types/room';
import type { UserType } from '@/_shared/types/user';
import type { ClientType } from '@/_shared/types/client';
import { uniqueNamesGenerator, names } from 'unique-names-generator';

const generateName = (response: Awaited<ReturnType<NextMiddleware>>) => {
  if (!response) return '';

  const userAuthHeader = response.headers.get('user-auth');
  const user: UserType.AuthUserData | null =
    typeof userAuthHeader === 'string'
      ? JSON.parse(userAuthHeader)
      : userAuthHeader;

  const clientName = user
    ? user.name
    : uniqueNamesGenerator({
        dictionaries: [names, names],
        separator: ' ',
        length: 2,
      });

  return clientName;
};

const createClient = async (
  request: NextRequest,
  response: Awaited<ReturnType<NextMiddleware>>,
  roomID: string,
  clientID: string
) => {
  const clientData = {
    clientID: clientID,
    clientName: '',
  };

  if (!response) return clientData;

  const clientName = generateName(response);

  try {
    const createClientResponse: RoomType.CreateClientResponse =
      await InternalApiFetcher.post(`/api/room/${roomID}/register`, {
        body: JSON.stringify({
          uid: clientData.clientID,
          name: clientName,
        }),
      });

    clientData.clientID = createClientResponse.data
      ? createClientResponse.data.clientID
      : clientData.clientID;
    clientData.clientName = createClientResponse.data
      ? createClientResponse.data.name
      : clientData.clientName;
  } finally {
    clientData.clientID = clientData.clientID;
    clientData.clientName = clientData.clientName;
  }

  return clientData;
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
      const clientID = cookies().get('client_id')?.value || '';
      const client: ClientType.ClientData = roomData
        ? await createClient(request, response, roomID, clientID)
        : {
            clientID: '',
            clientName: '',
          };

      response.headers.set(
        'Set-Cookie',
        `client_id=${client.clientID};path=${request.nextUrl.pathname};SameSite=lax;`
      );
      response.headers.set('user-client', JSON.stringify(client));
      response.headers.set('room-data', JSON.stringify(roomData));
    }

    return response;
  };
}
