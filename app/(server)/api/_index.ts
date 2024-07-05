import { EventRepo } from '@/(server)/_features/event/repository';
import { insertEvent, selectEvent } from '@/(server)/_features/event/schema';
import { EventService } from '@/(server)/_features/event/service';
import { RoomRepo } from '@/(server)/_features/room/repository';
import { RoomService } from '@/(server)/_features/room/service';

export const eventRepo = new EventRepo();
export const eventService = new EventService();
export const roomRepo = new RoomRepo();
export const roomService = new RoomService(roomRepo);
