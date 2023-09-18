export interface roomService {
  createRoom(roomData: Room): Promise<Room>;
  getRoom(roomId: string): Promise<Room | undefined>;
}

export interface Room {
  id?: string | null;
  roomID?: string | null;
  createdBy?: number | null;
}
