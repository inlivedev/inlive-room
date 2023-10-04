import { iRoomService } from './routes';
import { room } from '@/_shared/utils/sdk';
import { Room } from './routes';
import Sqids from 'sqids';

export interface iRoomRepo {
  addRoom(room: Room): Promise<Room>;
  getRoomById(id: string): Promise<Room | undefined>;
  updateRoomById(room: Room): Promise<Room | undefined>;
  isPersistent(): boolean;
}

export class service implements iRoomService {
  _repo: iRoomRepo;
  _sdk = room;

  constructor(repo: iRoomRepo) {
    this._repo = repo;
  }

  async createRoom(userID: number): Promise<Room> {
    const RoomResp = await this._sdk.createRoom();

    const newRoom: Room = {
      id: generateID(),
      roomId: RoomResp.data.roomId,
      createdBy: userID,
    };

    if (this._repo.isPersistent()) {
      while (true) {
        try {
          const room = await this._repo.addRoom(newRoom);
          return room;
        } catch (error) {
          const err = error as Error;
          if (err.message.includes('duplicate key')) newRoom.id = generateID();
          else throw err;
        }
      }
    } else {
      return {
        id: RoomResp.data.roomId,
        roomId: RoomResp.data.roomId,
        createdBy: userID,
      };
    }
  }

  async joinRoom(roomId: string): Promise<Room | undefined> {
    if (this._repo.isPersistent()) {
      let room = await this._repo.getRoomById(roomId);

      if (room === undefined) {
        throw new Error('Room not exists');
      }

      const remoteRoom = await this._sdk.getRoom(room.roomId);

      if (remoteRoom.data.roomId == '') {
        const newRemoteRoom = await this._sdk.createRoom();

        if (newRemoteRoom.data.roomId == '') {
          throw new Error(
            'Error occured during accessing room data, please try again later'
          );
        }
        room.roomId = newRemoteRoom.data.roomId;

        room = await this._repo.updateRoomById(room);

        if (room == undefined) {
          throw new Error(
            'Error occured during accessing room data, please try again later'
          );
        }

        return room;
      }

      return room;
    } else {
      const remoteRoom = await this._sdk.getRoom(roomId);
      if (remoteRoom.ok) {
        const newRoom: Room = {
          id: remoteRoom.data.roomId,
          name: remoteRoom.data.roomName,
          roomId: remoteRoom.data.roomId,
          createdBy: 0,
        };
        return newRoom;
      }

      throw new Error('Room not exists');
    }
  }
}

const generateRandomNumber = (): number => {
  return Math.floor(Math.random() * 10);
};

const generateID = (): string => {
  const sqids = new Sqids();
  const numArray = [
    generateRandomNumber(),
    generateRandomNumber(),
    generateRandomNumber(),
    generateRandomNumber(),
    generateRandomNumber(),
  ];
  return sqids.encode(numArray);
};
