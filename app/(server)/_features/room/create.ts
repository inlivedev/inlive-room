import { Room, roomService } from "@/(server)/api/room/interface";

export class service implements roomService{
    constructor(){
        console.log("initialized")
    }

    createRoom(roomData: Room): Room {
        throw new Error("not yet implemented")
    }

    getRoom(roomId: string): Room {
        throw new Error("not yet implemented")
    }
}