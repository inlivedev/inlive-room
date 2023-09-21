import { FetcherResponse } from '@/_shared/utils/fetcher';
import { Room } from '@/(server)/_features/room/routes';

export type CreateJoinRoomResponse = FetcherResponse & {
  code: number;
  data?: Room;
  message: string;
};
