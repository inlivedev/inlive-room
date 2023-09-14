export interface roomService {
  createRoom(roomData: Room): Room;
  getRoom(roomId: string): Room;
}

export interface Room {
  id: string;
  createdBy: number;
}
