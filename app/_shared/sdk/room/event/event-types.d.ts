import type { Event } from './event';

export type Event = typeof Event;
export type ReturnEvent = ReturnType<Event>;

export type EventItem = Set<(arg0: any) => void>;

export type EventItems = {
  [key: string]: EventItem;
};

export as namespace RoomEventTypes;
