import type { NextFetchEvent, NextMiddleware, NextRequest } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { InternalApiFetcher } from '@/_shared/utils/fetcher';
import type { RoomType } from '@/_shared/types/room';
import type { AuthType } from '@/_shared/types/auth';
import type { ClientType } from '@/_shared/types/client';
import { customAlphabet } from 'nanoid';

const registerClient = async (
  roomID: string,
  clientName: string,
  joinID?: string | null
) => {
  try {
    const response: RoomType.CreateClientResponse =
      await InternalApiFetcher.post(`/api/rooms/${roomID}/register`, {
        body: JSON.stringify({
          name: clientName,
          joinID: joinID,
        }),
      });

    const data = response.data || {};

    const client: ClientType.ClientData = {
      clientID: data.clientID || '',
      clientName: data.name || clientName,
    };

    return client;
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        message: `API call error when trying to register a client in middleware`,
      },
    });
    console.error(error);
  }
};

const getClientName = (
  request: NextRequest,
  response: Awaited<ReturnType<NextMiddleware>>
) => {
  if (!response) return '';

  const userAuthHeader = response.headers.get('user-auth');
  const user: AuthType.CurrentAuthData | null =
    typeof userAuthHeader === 'string'
      ? JSON.parse(userAuthHeader)
      : userAuthHeader;

  const userName = user ? user.name : '';
  const clientName = request.cookies.get('client_name')?.value || '';
  return clientName ? clientName : userName;
};

const generateName = (name = '') => {
  if (name.trim().length > 0) return name;

  const alphabets = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '012345789'; // number 6 is removed

  const generatedAlphabets = customAlphabet(alphabets, 4);
  const generatedNumbers = customAlphabet(numbers, 2);
  const id = generatedAlphabets() + generatedNumbers();

  const result = `guest-${id}`;
  return result;
};

export function withRoomMiddleware(middleware: NextMiddleware) {
  return async (request: NextRequest, event: NextFetchEvent) => {
    const response = await middleware(request, event);
    const splitPath = request.nextUrl.pathname.split('/');

    if (response && splitPath[1] === 'rooms' && splitPath.length === 3) {
      const roomID = splitPath[2];
      let roomData: RoomType.RoomData | null = null;

      const joinID = request.nextUrl.searchParams.get('joinID');

      try {
        const roomResponse: RoomType.CreateGetRoomResponse =
          await InternalApiFetcher.get(`/api/rooms/${roomID}`, {
            cache: 'no-cache',
          });

        roomData = roomResponse?.data ? roomResponse.data : null;
      } catch (error) {
        Sentry.captureException(error, {
          extra: {
            message:
              'API call error when trying to join to the room in middleware',
          },
        });
        console.error(error);
      }

      let client: ClientType.ClientData = {
        clientID: '',
        clientName: '',
      };

      if (roomData) {
        const clientName = getClientName(request, response);
        const newName = generateName(clientName);
        const registeredClient = await registerClient(roomID, newName, joinID);
        client = registeredClient || client;
      }

      response.headers.set('user-client', JSON.stringify(client));
      response.headers.set('room-data', JSON.stringify(roomData));
    }

    return response;
  };
}
