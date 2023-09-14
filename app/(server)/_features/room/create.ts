import { Room, roomService } from "@/(server)/api/room/interface";

// TODO
// Create Server Datastore
// AddRoom({roomID,roomName,createdBy})

export interface RoomRepoInterface {
  addRoom(roomData : Room): Room;
  getRoomById(id:string):Room
}

export class service implements roomService {
    _repo:RoomRepoInterface

  constructor(repo : RoomRepoInterface) {
    this._repo=repo
  }

  createRoom(roomData: Room): Room {
    return this._repo.addRoom(roomData)
  }

  getRoom(roomId: string): Room {
    return this._repo.getRoomById(roomId)
  }
}
