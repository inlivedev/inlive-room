import { room } from "@/_shared/utils/sdk";
import { Room } from "../api/room/interface";
import { RoomRepoInterface } from "./room/create";

export class ServerDataStore implements RoomRepoInterface {
  private rooms: Map<string, Room>;

  constructor() {
    this.rooms = new Map<string, Room>();
  }

  // Function to create a new room
  addRoom(roomData: Room): Room {
    this.rooms.set(roomData.id, roomData);
    const createdRoom = this.rooms.get(roomData.id);

    if (!createdRoom) {
      throw new Error("failed to add room to datastore");
    }

    return createdRoom;
  }

  getRoomById(roomId: string): Room {
    const roomData = this.rooms.get(roomId);

    if (!roomData) {
      throw new Error("failed to add room to datastore");
    }

    return roomData;
  }
}
