export interface roomService {
  createRoom(userID: number): Promise<Room>;
  getRoom(roomId: string): Promise<Room | undefined>;
}

export interface Room {
  id?: string | null;         //InLive Room ID
  name?: string| null;
  roomID?: string | null;     //InLive Hub Room ID (External)
  createdBy?: number | null;
}