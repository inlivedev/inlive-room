import type { NextFetchEvent, NextMiddleware, NextRequest } from 'next/server';
import { InternalApiFetcher } from '@/_shared/utils/fetcher';
import { cookies } from 'next/headers';
import type { RoomType } from '@/_shared/types/room';
import type { UserType } from '@/_shared/types/user';
import type { ClientType } from '@/_shared/types/client';
import { uniqueNamesGenerator, names } from 'unique-names-generator';

const createClientRequest = async (
  roomID: string,
  request: NextRequest,
  response: Awaited<ReturnType<NextMiddleware>>
) => {
  try {
    let clientData: ClientType.ClientData = {
      clientID: '',
      clientName: '',
    };

    if (response) {
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

      const createClientResponse: RoomType.CreateClientResponse =
        await InternalApiFetcher.post(`/api/room/${roomID}/register`, {
          body: JSON.stringify({
            name: clientName,
          }),
        });

      clientData = {
        clientID: createClientResponse.data.clientID,
        clientName: createClientResponse.data.name,
      };

      response.headers.set(
        'Set-Cookie',
        `client_id=${clientData.clientID};path=${request.nextUrl.pathname};SameSite=lax;`
      );
    }

    return clientData;
  } catch (error) {
    console.error(error);
    throw error;
  }
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
      let clientData: ClientType.ClientData = {
        clientID: '',
        clientName: '',
      };

      if (roomData) {
        const clientID = cookies().get('client_id')?.value || '';

        if (clientID) {
          const participantsResponse: RoomType.ParticipantResponse =
            await InternalApiFetcher.post(`/api/room/${roomID}/participant`, {
              body: JSON.stringify({
                clientIDs: [clientID],
              }),
            });

          const participant = participantsResponse.data
            ? participantsResponse.data[0]
            : null;

          if (participant) {
            clientData = {
              clientID: participant.clientID,
              clientName: participant.name,
            };
          } else {
            const clientDataResponse = await createClientRequest(
              roomID,
              request,
              response
            );
            clientData = {
              clientID: clientDataResponse.clientID,
              clientName: clientDataResponse.clientName,
            };
          }
        } else {
          const clientDataResponse = await createClientRequest(
            roomID,
            request,
            response
          );
          clientData = {
            clientID: clientDataResponse.clientID,
            clientName: clientDataResponse.clientName,
          };
        }
      }

      response.headers.set('user-client', JSON.stringify(clientData));
      response.headers.set('room-data', JSON.stringify(roomData));
    }

    return response;
  };
}
