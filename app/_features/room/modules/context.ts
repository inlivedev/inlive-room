'use client';

import { createContext, useContext } from 'react';
import type { Room } from '@/_features/room/modules/room';

export type StreamStateType = {
  data: MediaStream;
  type: 'local' | 'remote';
};

export type RoomStreamsStateType = {
  [key: string]: StreamStateType;
};

export type RoomContextType = {
  streams: RoomStreamsStateType;
  room: Room | null;
};

export const RoomContext = createContext({
  streams: {},
  room: null,
} as RoomContextType);

export const useRoomContext = () => useContext(RoomContext);
