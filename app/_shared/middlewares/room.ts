import {
  NextResponse,
  type NextFetchEvent,
  type NextMiddleware,
  type NextRequest,
} from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { InternalApiFetcher } from '@/_shared/utils/fetcher';
import type { RoomType } from '@/_shared/types/room';
import type { AuthType } from '@/_shared/types/auth';
import type { ClientType } from '@/_shared/types/client';
import type { EventType } from '@/_shared/types/event';
import { customAlphabet } from 'nanoid';
import { cookies } from 'next/headers';

const registerClient = async (
  roomID: string,
  clientName: string,
  clientID?: string | null
) => {
  try {
    const response: RoomType.CreateClientResponse =
      await InternalApiFetcher.post(`/api/rooms/${roomID}/register`, {
        body: JSON.stringify({
          name: clientName,
          clientID: clientID,
        }),
      });

    return response;
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
  return async (request: NextRequest, nextEvent: NextFetchEvent) => {
    const response = await middleware(request, nextEvent);
    const splitPath = request.nextUrl.pathname.split('/');

    if (response && splitPath[1] === 'rooms' && splitPath.length === 3) {
      const roomID = splitPath[2];
      let roomData: RoomType.RoomData | null = null;
      let eventData: EventType.Event | null = null;
      let clientID = request.nextUrl.searchParams.get('clientID');
      let client: ClientType.ClientData = {
        clientID: '',
        clientName: '',
      };

      try {
        const roomResponse: RoomType.CreateGetRoomResponse =
          await InternalApiFetcher.get(`/api/rooms/${roomID}`, {
            cache: 'no-cache',
          });

        roomData = roomResponse?.data ? roomResponse.data : null;
        eventData = roomResponse?.meta?.event || null;
      } catch (error) {
        Sentry.captureException(error, {
          extra: {
            message:
              'API call error when trying to join to the room in middleware',
          },
        });
        console.error(error);
      }

      if (roomData) {
        let newName = '';

        if (typeof roomData.meta !== 'undefined' && eventData) {
          const requestToken = cookies().get('token');
          if (requestToken) {
            const clientData: EventType.ParticipantResponse =
              await InternalApiFetcher.get(
                `/api/events/${eventData.id}/client`,
                {
                  headers: {
                    Cookie: `token=${requestToken.value}`,
                  },
                  cache: 'no-cache',
                }
              );

            if (clientData?.data) {
              clientID = clientData.data.clientId;
              newName =
                clientData.data.firstName + ' ' + clientData.data.lastName;
            }
          }

          if (eventData.status === 'completed') {
            const url = request.nextUrl.clone();
            url.pathname = `/events/${eventData.slug}`;
            url.searchParams.append('error', 'eventCompleted');
            return NextResponse.redirect(url);
          }

          if (!clientID) {
            const url = request.nextUrl.clone();
            url.pathname = `/events/${eventData.slug}`;
            url.searchParams.append('error', 'noClientID');
            return NextResponse.redirect(url);
          }
        }

        if (!newName) {
          const clientName = getClientName(request, response);
          newName = generateName(clientName);
        }

        const registeredClient = await registerClient(
          roomID,
          newName,
          clientID
        );

        if (!registeredClient && eventData) {
          const url = request.nextUrl.clone();
          url.pathname = `/events/${eventData?.slug}`;
          url.searchParams.append('error', 'invalidClientID');
          return NextResponse.redirect(url);
        }

        client = {
          clientID: registeredClient?.data?.clientID || '',
          clientName: registeredClient?.data?.name || newName,
        };
      }

      response.headers.set('user-client', JSON.stringify(client));
      response.headers.set('room-data', JSON.stringify(roomData));
    }

    return response;
  };
}
