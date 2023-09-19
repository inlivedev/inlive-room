import { Room as string, roomService } from "@/(server)/api/room/interface";
import { Mixpanel } from "@/_shared/components/analytics/mixpanel";
import { room } from "@/_shared/utils/sdk";
import { Room } from "@/(server)/api/room/interface";
import Sqids from "sqids";

export interface RoomRepoInterface {
  addRoom(roomData: Room): Promise<Room>;
  getRoomById(id: string): Promise<Room | undefined>;
}

export class service implements roomService {
  _repo: RoomRepoInterface;

  constructor(repo: RoomRepoInterface) {
    this._repo = repo;
  }

  async createRoom(userID: number): Promise<Room> {
    const RoomResp = await room.createRoom();

    const newRoom: Room = {
      id: generateID(),
      roomID: RoomResp.data.roomId,
      createdBy: userID,
    };

    Mixpanel.track("Create room", {
      roomId: newRoom.id,
      externalRoomID: newRoom.roomID,
      createdBy: newRoom.createdBy,
    });

    return this._repo.addRoom(newRoom);
  }

  async getRoom(roomId: string): Promise<Room | undefined> {
    return await this._repo.getRoomById(roomId);
  }
}

const generateID = (): string => {
  const sqids = new Sqids();
  return sqids.encode([Math.random(), Math.random(), Math.random()]);
};
