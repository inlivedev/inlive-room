import { type FetcherResponse } from '@/_shared/utils/fetcher';
import { type Room, Participant } from '@/(server)/_features/room/routes';

export declare namespace RoomType {
  type RoomData = Room;

  type CreateJoinRoomResponse = FetcherResponse & {
    message: string;
    data: Room;
  };

  type CreateClientResponse = FetcherResponse & {
    message: string;
    data: Participant;
  };

  type ParticipantResponse = FetcherResponse & {
    message: string;
    data: Participant[];
  };
}
