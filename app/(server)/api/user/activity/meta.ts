import { z } from 'zod';

export const RoomDurationMeta = z.object({
  roomID: z.string(),
  clientID: z.string(),
  name: z.string().optional(),
  joinTime: z
    .string()
    .datetime({ offset: true })
    .transform((val) => new Date(val)),
  leaveTime: z
    .string()
    .datetime({ offset: true })
    .transform((val) => new Date(val)),
  roomType: z.enum(['meeting', 'event']),
  duration: z.number().default(0),
  trigger: z.enum(['beforeunload', 'leave-button']),
});

export const ArrayRoomDurationMeta = z.array(RoomDurationMeta);
