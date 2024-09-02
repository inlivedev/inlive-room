import type { Room } from '@/(server)/_features/room/service';
import { iRoomRepo } from './service';
import { db } from '@/(server)/_shared/database/database';
import { insertRoom, rooms } from '@/(server)/_features/room/schema';
import { and, eq } from 'drizzle-orm';

const persistentData =
  process.env.NEXT_PUBLIC_PERSISTENT_DATA === 'true' || false;

export class RoomRepo implements iRoomRepo {
  // Function to create a new room
  async addRoom(roomData: insertRoom) {
    if (!persistentData) {
      return undefined;
    }

    const data = await db.insert(rooms).values(roomData).returning();
    return data[0];
  }

  async getRoomById(roomId: string): Promise<Room | undefined> {
    if (!persistentData) {
      return undefined;
    }

    return await db.query.rooms.findFirst({ where: eq(rooms.id, roomId) });
  }

  async updateRoomById(room: Room): Promise<Room | undefined> {
    if (!persistentData) {
      return undefined;
    }

    const data = await db
      .update(rooms)
      .set(room)
      .where(eq(rooms.id, room.id))
      .returning();
    return data[0];
  }

  removeRoom(roomId: string, createdBy: number) {
    if (!persistentData) {
      return undefined;
    }

    return db
      .delete(rooms)
      .where(and(eq(rooms.id, roomId), eq(rooms.createdBy, createdBy)))
      .returning();
  }

  isPersistent(): boolean {
    return persistentData;
  }
}
