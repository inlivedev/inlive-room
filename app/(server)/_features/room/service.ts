import { Room, roomService } from "@/(server)/api/room/interface";
import Sqids from "sqids"

// TODO
// Create Server Datastore
// AddRoom({roomID,roomName,createdBy})

export interface RoomRepoInterface {
  addRoom(roomData : Room): Promise<Room>;
  getRoomById(id:string):Promise<Room | undefined>
}

export class service implements roomService {
    _repo:RoomRepoInterface

  constructor(repo : RoomRepoInterface) {
    this._repo=repo
  }

  async createRoom(roomData: Room): Promise<Room> {
    roomData.id=generateID()
    return await this._repo.addRoom(roomData)
  }

  async getRoom(roomId: string): Promise<Room|undefined> {
    return await this._repo.getRoomById(roomId)
  }
}


  const generateID = (): string => {
      const sqids = new Sqids()
      return sqids.encode([Math.random(),Math.random(),Math.random()])
    }
