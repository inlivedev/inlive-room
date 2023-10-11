import type { Room } from '@/(server)/_features/room/service';
import { iRoomRepo } from './service';
import { db } from '@/(server)/_shared/database/database';
import { rooms } from '@/(server)/_features/room/schema';
import { eq } from 'drizzle-orm';

const persistentData = process.env.PERSISTENT_DATA || false;

export class RoomRepo implements iRoomRepo {
  // Function to create a new room
  async addRoom(roomData: Room) {
    const data = await db.insert(rooms).values(roomData).returning();
    return data[0];
  }

  async getRoomById(roomId: string): Promise<Room | undefined> {
    return await db.query.rooms.findFirst({ where: eq(rooms.id, roomId) });
  }

  async updateRoomById(room: Room): Promise<Room | undefined> {
    const data = await db
      .update(rooms)
      .set(room)
      .where(eq(rooms.id, room.id))
      .returning();
    return data[0];
  }

  isPersistent(): boolean {
    if (persistentData === 'true') return true;

    return false;
  }
}
