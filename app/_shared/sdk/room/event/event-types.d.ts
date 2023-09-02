import type { createEvent } from './event';

export type CreateEvent = typeof createEvent;
export type InstanceEvent = ReturnType<
  ReturnType<CreateEvent>['createInstance']
>;

export type EventHandlers = Set<(arg0: any) => void>;

export type EventItems = {
  [key: string]: EventHandlers;
};

export as namespace RoomEventType;
