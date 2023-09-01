import type { Event, eventFactory } from './event';

export type Event = typeof Event;
export type ReturnEvent = ReturnType<ReturnType<typeof eventFactory>['create']>;

export type EventItem = Set<(arg0: any) => void>;

export type EventItems = {
  [key: string]: EventItem;
};

export as namespace RoomEventTypes;
