import { iRoomService, Participant } from './routes';
import { room } from '@/_shared/utils/sdk';
import { Room } from './routes';
import Sqids from 'sqids';
import { FetcherResponse, InliveHubFetcher } from '@/_shared/utils/fetcher';
import * as Sentry from '@sentry/nextjs';

export interface iRoomRepo {
  addRoom(room: Room): Promise<Room>;
  getRoomById(id: string): Promise<Room | undefined>;
  updateRoomById(room: Room): Promise<Room | undefined>;
  isPersistent(): boolean;
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

    const clientResp = await this._sdk.createClient(roomData?.id);

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
    while (true) {
      const roomID = generateID();
      const RoomResp = await this._sdk.createRoom('', roomID);
      if (RoomResp.code == 409) continue;
      if (RoomResp.code > 299)
        throw new Error('Error during creating room, please try again later');

      const ChannelResp = await this._sdk.createDataChannel(
        roomID,
        'chat',
        true
      );

      if (!ChannelResp.ok) {
        Sentry.captureException(
          new Error(`Room ${roomID} : failed to create chat data channel`)
        );
      }

      if (!this._roomRepo.isPersistent())
        return {
          id: RoomResp.data.roomId,
          createdBy: userID,
        };

      try {
        const room = await this._roomRepo.addRoom({
          id: roomID,
          createdBy: userID,
        });
        return room;
      } catch (error) {
        const err = error as Error;
        if (err.message.includes('duplicate key')) continue;
        else throw err;
      }
    }
  }

  async joinRoom(roomId: string): Promise<Room | undefined> {
    if (!this._roomRepo.isPersistent()) {
      const remoteRoom = await this._sdk.getRoom(roomId);
      if (remoteRoom.ok) {
        const room: Room = {
          id: remoteRoom.data.roomId,
          name: remoteRoom.data.roomName,
          createdBy: 0,
        };

        return room;
      }

      throw new Error('Room not exists');
    }

    const room = await this._roomRepo.getRoomById(roomId);

    if (!room) {
      throw new Error('Room not exists');
    }

    const remoteRoom = await this._sdk.getRoom(room.id);

    if (remoteRoom.code > 299) {
      const newRemoteRoom = await this._sdk.createRoom('', room.id);
      if (newRemoteRoom.code > 299) {
        if (newRemoteRoom.code == 409) throw new Error(newRemoteRoom.message);
        throw new Error(
          'Error occured during accessing room data, please try again later'
        );
      }

      const ChannelResp = await this._sdk.createDataChannel(
        room.id,
        'chat',
        true
      );

      if (!ChannelResp.ok) {
        Sentry.captureException(
          new Error(`Room ${room.id} : failed to create chat data channel`)
        );
      }
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
