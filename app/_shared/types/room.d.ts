import { type FetcherResponse } from '@/_shared/utils/fetcher';
import { type Room } from '@/(server)/_features/room/routes';
import { Participant } from '@/(server)/_features/room/service';

export declare namespace RoomType {
  type CreateJoinRoomResponse = FetcherResponse & {
    message: string;
    data: Room;
  };

  type CreateClientResponse = FetcherResponse & {
    message: string;
    data: Participant;
  };
}
