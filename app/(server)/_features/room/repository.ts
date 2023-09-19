import { Room } from "@/(server)/api/room/interface";
import { RoomRepoInterface } from "./service";
import { db } from "@/(server)/_shared/database/database";
import { rooms } from "@/(server)/_features/room/schema";
import { eq } from "drizzle-orm";

export class RoomRepo implements RoomRepoInterface {
  // Function to create a new room
  async addRoom(roomData: Room) {
    const data = await db.insert(rooms).values(roomData).returning();
    return data[0];
  }

  async getRoomById(roomId: string): Promise<Room| undefined> {
   return await db.query.rooms.findFirst({ where: eq(rooms.id, roomId) });
  }
}
