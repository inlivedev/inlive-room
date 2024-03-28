import type { FetcherResponse } from '@/_shared/utils/fetcher';
import type { Room, Client } from '@/(server)/_features/room/service';

export declare namespace RoomType {
  type RoomData = Room;

  enum Type {
    Meeting = 'meeting',
    Event = 'event',
  }

  type CreateGetRoomResponse = FetcherResponse & {
    message: string;
    data: Room;
  };

  type CreateClientResponse = FetcherResponse & {
    message: string;
    data: Client;
  };

  type RegisteredParticipantsResponse = FetcherResponse & {
    message: string;
    data: Client[];
  };
}
