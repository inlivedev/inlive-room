import { type FetcherResponse } from '@/_shared/utils/fetcher';
import { type Room } from '@/(server)/_features/room/routes';

export declare namespace RoomType {
  type CreateJoinRoomResponse = FetcherResponse & {
    message: string;
    data: Room;
  };
}
