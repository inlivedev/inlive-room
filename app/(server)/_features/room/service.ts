import { iRoomService, Participant } from './routes';
import { room } from '@/_shared/utils/sdk';
import { Room } from './routes';
import Sqids from 'sqids';

export interface iRoomRepo {
  addRoom(room: Room): Promise<Room>;
  getRoomById(id: string): Promise<Room | undefined>;
  updateRoomById(room: Room): Promise<Room | undefined>;
}

export interface iParticipantRepo {
  addParticipant(participant: Participant): Promise<Participant>;
  getAllParticipant(roomID: string): Promise<Participant[]>;
  getByClientID(
    roomID: string,
    clientID: string
  ): Promise<Participant | undefined>;
  getByMultipleClientID(
    roomID: string,
    clientID: string[]
  ): Promise<Participant[]>;
}

export class service implements iRoomService {
  _roomRepo: iRoomRepo;
  _participantRepo: iParticipantRepo;
  _sdk = room;

  constructor(roomRepo: iRoomRepo, participantRepo: iParticipantRepo) {
    this._roomRepo = roomRepo;
    this._participantRepo = participantRepo;
  }

  async createClient(roomId: string, name: string): Promise<Participant> {
    const roomData = await this._roomRepo.getRoomById(roomId);

    if (!roomData) {
      throw new Error('room not found');
    }

    const clientResp = await this._sdk.createClient(roomData?.roomId);

    if (!clientResp.data.clientId) {
      throw new Error(
        'failed to add client to the meeting room, please try again later'
      );
    }

    const data: Participant = {
      clientID: clientResp.data.clientId,
      name: name,
      roomID: roomId,
    };

    const participant = await this._participantRepo.addParticipant(data);
    return participant;
  }

  async getClients(
    roomID: string,
    clientIDs: string[]
  ): Promise<Participant[]> {
    const clients = await this._participantRepo.getByMultipleClientID(
      roomID,
      clientIDs
    );

    return clients;
  }

  async getAllClients(roomID: string) {
    return await this._participantRepo.getAllParticipant(roomID);
  }

  async createRoom(userID: number): Promise<Room> {
    const RoomResp = await this._sdk.createRoom();

    const newRoom: Room = {
      id: generateID(),
      roomId: RoomResp.data.roomId,
      createdBy: userID,
    };

    while (true) {
      try {
        const room = await this._roomRepo.addRoom(newRoom);
        return room;
      } catch (error) {
        const err = error as Error;
        if (err.message.includes('duplicate key')) newRoom.id = generateID();
        else throw err;
      }
    }
  }

  async joinRoom(roomId: string): Promise<Room | undefined> {
    let room = await this._roomRepo.getRoomById(roomId);

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

      room = await this._roomRepo.updateRoomById(room);

      if (room == undefined) {
        throw new Error(
          'Error occured during accessing room data, please try again later'
        );
      }

      return room;
    }

    return room;
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
