import type { NextFetchEvent, NextMiddleware, NextRequest } from 'next/server';
import { InternalApiFetcher } from '@/_shared/utils/fetcher';
import { cookies } from 'next/headers';
import type { RoomType } from '@/_shared/types/room';
import type { UserType } from '@/_shared/types/user';
import { uniqueNamesGenerator, names } from 'unique-names-generator';

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
      let clientData = null;

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
              id: participant.clientID,
              name: participant.name,
            };
          }
        } else {
          const userAuth: UserType.AuthUserData = JSON.parse(
            response.headers.get('user-auth') || ''
          );

          const clientName = userAuth
            ? userAuth.name
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

          response.headers.set(
            'Set-Cookie',
            `client_id=${createClientResponse.data.clientID};path=${request.nextUrl.pathname};SameSite=lax;`
          );
        }
      }

      response.headers.set('user-client', JSON.stringify(clientData));
      response.headers.set('room-data', JSON.stringify(roomData));
    }

    return response;
  };
}
