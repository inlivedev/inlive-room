export interface roomService {
  createRoom(userID: number): Promise<Room>;
  joinRoom(roomId: string): Promise<Room | undefined>;
}

export interface Room {
  id: string; //InLive Room ID
  name?: string | null;
  roomId: string; //InLive Hub Room ID (External)
  createdBy: number;
}
