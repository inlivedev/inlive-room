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
): Promise<RoomType.CreateClientResponse | undefined> => {
  try {
    return await InternalApiFetcher.post(`/api/rooms/${roomID}/register`, {
      body: JSON.stringify({ name: clientName, clientID }),
    });
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        message:
          'API call error when trying to register a client in middleware',
      },
    });
    console.error(error);
  }
};

const getClientName = (
  request: NextRequest,
  response: Awaited<ReturnType<NextMiddleware>>
): string => {
  if (!response) return '';

  const userAuthHeader = response.headers.get('user-auth');
  const user: AuthType.CurrentAuthData | null =
    typeof userAuthHeader === 'string'
      ? JSON.parse(userAuthHeader)
      : userAuthHeader;

  const userName = user?.name || '';
  const clientName = request.cookies.get('client_name')?.value || '';
  return clientName || userName;
};

const generateName = (name = ''): string => {
  if (name.trim().length > 0) return name;

  const alphabets = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '012345789'; // number 6 is removed

  const generateAlphabets = customAlphabet(alphabets, 4);
  const generateNumbers = customAlphabet(numbers, 2);
  const id = generateAlphabets() + generateNumbers();

  return `guest-${id}`;
};

const handleEventRedirect = (
  request: NextRequest,
  eventData: Omit<EventType.Event, 'host' | 'availableSlots'>,
  error: string,
  destination: 'webinars'
): NextResponse => {
  const url = request.nextUrl.clone();
  url.pathname = `/${destination}/${eventData.slug}`;
  url.searchParams.append('error', error);
  return NextResponse.redirect(url);
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
        | undefined = undefined;
      let clientID = request.nextUrl.searchParams.get('clientID');
      let client: ClientType.ClientData = { clientID: '', clientName: '' };

      try {
        const roomResponse: RoomType.GetRoomResponse =
          await InternalApiFetcher.get(`/api/rooms/${roomID}`, {
            cache: 'no-store',
            next: { revalidate: 0 },
          });
        roomData = roomResponse.data;
        eventData = roomResponse.data?.event;
      } catch (error) {
        Sentry.captureException(error, {
          extra: {
            message:
              'API call error when trying to join the room in middleware',
          },
        });
        console.error(error);
      }

      if (roomData) {
        let newName = '';

        if (eventData && eventData.category?.name !== 'meetings') {
          const requestToken = cookies().get('token');
          if (requestToken) {
            const participantData: EventType.ParticipantResponse =
              await InternalApiFetcher.get(
                `/api/events/${eventData.id}/client`,
                {
                  headers: { Cookie: `token=${requestToken.value}` },
                  cache: 'no-cache',
                }
              );

            if (participantData?.data) {
              clientID = participantData.data.clientID;
              newName = participantData.data.user.name;
            }
          }

          if (eventData.status === 'completed') {
            return handleEventRedirect(
              request,
              eventData,
              'eventCompleted',
              'webinars'
            );
          }

          if (!clientID) {
            return handleEventRedirect(
              request,
              eventData,
              'noClientID',
              'webinars'
            );
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

        if (
          registeredClient?.code === 400 &&
          eventData &&
          eventData.category?.name !== 'meetings'
        ) {
          return handleEventRedirect(
            request,
            eventData,
            'invalidClientID',
            'webinars'
          );
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
