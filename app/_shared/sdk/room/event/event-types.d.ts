export type Event = Set<(arg0: any) => void>;

export type Events = {
  [key: string]: Event;
};

export as namespace RoomEventTypes;
