import type { FetcherResponse } from '@/_shared/utils/fetcher';
import type { Room, Participant } from '@/(server)/_features/room/service';
import { AllParticipants } from '@/(server)/_features/event/service';

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
    data: Participant;
  };

  type RegisteredParticipantsResponse = FetcherResponse & {
    message: string;
    data: Participant[];
  };

  type AllParticipantsResponse = FetcherResponse & {
    message: string;
    data: AllParticipants;
    meta: PageMeta;
  };
}
