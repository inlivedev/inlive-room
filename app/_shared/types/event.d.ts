import type { FetcherResponse } from '@/_shared/utils/fetcher';
import {
  selectEvent,
  selectParticipant,
} from '@/(server)/_features/event/schema';
import { selectUser } from '@/(server)/_features/user/schema';
import { PageMeta } from './types';
import { Participant } from '@/(server)/_features/event/service';

export declare namespace EventType {
  type Event = selectEvent & {
    host?: Partial<selectUser> | null;
  };

  type DetailEventResponse = FetcherResponse & {
    message: string;
    data: Event;
  };

  type GetStatsResponse = FetcherResponse & {
    data: {
      count: {
        registeree: number;
        registereeJoin: number;
        guestsJoin: number;
        totalJoined: number;
        registeredAttendance: number;

        // TODO
        // guestsAttendance
        // AllParticipantAttendance
      };

      percentage: {
        guestCountJoin: string; //countGuestJoin : countAllParticipantJoin

        registeredCountJoin: string; //countRegisteredJoin : countAllParticipantJoin
        registeredCountRegisteree: string; // countRegisteredJoin : countRegisteree

        registeredAttendCountJoin: string; // countRegisteredAttendance : countAllParticipantJoin
        registeredAttendCountRegisteree: string; // countRegisteredAttendance : countRegisteree

        // TODO
        // registeredAttendCountAttendance // countRegisteredAttendance : countAllParticipantAttendance
        // guestAttendCountAttendance // countGuestAttendance : countAllParticipantAttendance
        // guestAttendCountJoin // countGuestAttendance : countAllParticipantJoin
      };
    };
  };

  type RegisteredParticipant = FetcherResponse & {
    id: number;
    clientId: string;
    createdAt: string;
    email: string;
    firstName: string;
    lastName: string;
    description: string;
  };

  type RegisterParticipantResponse = FetcherResponse & {
    message: string;
    data: {
      event: Omit<Event, 'roomId'>;
      participant: selectParticipant;
    };
  };

  export type GetParticipantsResponse = FetcherResponse & {
    message: string;
    data: Participant[];
    meta: PageMeta;
  };

  export type EventParticipant = Participant;

  type Registeree = {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    createdAt: Date;
  };

  type GetRegistereeResponse = FetcherResponse & {
    message: string;
    data: Registeree[];
    meta: PageMeta;
  };

  type ListEventsResponse = FetcherResponse & {
    message: string;
    data?: Event[];
    meta: PageMeta;
  };

  type CreateLimit = FetcherResponse & {
    data: {
      count: number;
      limit: number;
    };
    message: string;
  };
}
