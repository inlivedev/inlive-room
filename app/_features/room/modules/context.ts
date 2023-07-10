import { createContext } from 'react';
import type { StreamsType } from '@/_features/room/modules/media';
import type { Room } from '@/_features/room/modules/room';

type ContextType = {
  streams: StreamsType;
  room: Room | null;
};

export const Context = createContext({
  streams: {},
  room: null,
} as ContextType);
