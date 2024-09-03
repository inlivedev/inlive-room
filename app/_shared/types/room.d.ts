import type { FetcherResponse } from '@/_shared/utils/fetcher';
import type { Room, Client } from '@/(server)/_features/room/service';
import { EventType } from './event';

export declare namespace RoomType {
  type RoomData = Room;

  enum Type {
    Meeting = 'meeting',
    Event = 'event',
  }

  type CreateRoomResponse = FetcherResponse & {
    message: string;
    data: Room;
  };

  type GetRoomResponse = FetcherResponse & {
    message: string;
    data: Room
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
