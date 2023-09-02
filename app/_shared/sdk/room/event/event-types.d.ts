import type { Event, factoryEvent } from './event';

export type Event = typeof Event;
export type FactoryEvent = typeof factoryEvent;
export type CreateEvent = ReturnType<FactoryEvent>['create'];

export type EventHandlers = Set<(arg0: any) => void>;

export type EventItems = {
  [key: string]: EventHandlers;
};

export as namespace RoomEventType;
