import {
  NextResponse,
  type NextFetchEvent,
  type NextMiddleware,
  type NextRequest,
} from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { FetcherResponse, InternalApiFetcher } from '@/_shared/utils/fetcher';
import type { RoomType } from '@/_shared/types/room';
import type { AuthType } from '@/_shared/types/auth';
import type { ClientType } from '@/_shared/types/client';
import type { EventType } from '@/_shared/types/event';
import { customAlphabet } from 'nanoid';
import { cookies } from 'next/headers';
import { selectRoom } from '@/(server)/_features/room/schema';

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
      let eventData:
        | Omit<EventType.Event, 'host' | 'availableSlots'>
        | null
        | undefined = null;
      let clientID = request.nextUrl.searchParams.get('clientID');
      let client: ClientType.ClientData = {
        clientID: '',
        clientName: '',
      };

      try {
        const roomResponse: FetcherResponse & {
          data: {
            room: selectRoom;
            event: EventType.Event;
          };
        } = await InternalApiFetcher.get(`/api/rooms/${roomID}`, {
          cache: 'no-cache',
        });
        roomData = roomResponse.data.room;
        eventData = roomResponse.data.event;
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

        if (eventData) {
          const requestToken = cookies().get('token');
          if (requestToken) {
            const participantData: EventType.ParticipantResponse =
              await InternalApiFetcher.get(
                `/api/events/${eventData.id}/client`,
                {
                  headers: {
                    Cookie: `token=${requestToken.value}`,
                  },
                  cache: 'no-cache',
                }
              );

            if (participantData?.data) {
              clientID = participantData.data.clientID;
              newName = participantData.data.user.name;
            }
          }

          if (eventData.status === 'completed') {
            const url = request.nextUrl.clone();
            url.pathname = `/events/${eventData.slug}`;
            url.searchParams.append('error', 'eventCompleted');
            return NextResponse.redirect(url);
          }

          if (!clientID && eventData.category?.name !== 'meetings') {
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
