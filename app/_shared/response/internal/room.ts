import { FetcherResponse } from '@/_shared/utils/fetcher';
import { Room } from '@/(server)/_features/room/routes';

export type CreateJoinRoomResponse = FetcherResponse & {
  data: Room;
  message: string;
};
