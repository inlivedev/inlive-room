import { roomService } from '@/(server)/api/room/interface';
import { Mixpanel } from '@/_shared/components/analytics/mixpanel';
import { room } from '@/_shared/utils/sdk';
import { Room } from '@/(server)/api/room/interface';
import Sqids from 'sqids';

export interface iRoomRepo {
  addRoom(room: Room): Promise<Room>;
  getRoomById(id: string): Promise<Room | undefined>;
  updateRoomById(room: Room): Promise<Room | undefined>;
}

export class service implements roomService {
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

    Mixpanel.track('Create room', {
      roomId: newRoom.id,
      externalRoomId: newRoom.roomId,
      createdBy: newRoom.createdBy,
    });

    return this._repo.addRoom(newRoom);
  }

  async joinRoom(roomId: string): Promise<Room | undefined> {
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
  }
}

const generateID = (): string => {
  const sqids = new Sqids();
  return sqids.encode([Math.random(), Math.random(), Math.random()]);
};
