import { iRoomService } from './routes';
import { room } from '@/_shared/utils/sdk';
import Sqids from 'sqids';
import * as Sentry from '@sentry/nextjs';

export interface Room {
  id: string;
  name?: string | null;
  createdBy: number;
}

export interface Participant {
  clientID: string;
  name: string;
  roomID: string | null;
}

export interface iRoomRepo {
  addRoom(room: Room): Promise<Room>;
  getRoomById(id: string): Promise<Room | undefined>;
  updateRoomById(room: Room): Promise<Room | undefined>;
  isPersistent(): boolean;
}

export interface iParticipantRepo {
  addParticipant(participant: Participant): Promise<Participant>;
  getAllParticipant(roomID: string): Promise<Participant[]>;
  getByClientID(clientID: string): Promise<Participant | undefined>;
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

  async createClient(
    roomId: string,
    clientID: string,
    clientName: string
  ): Promise<Participant> {
    if (!this._roomRepo.isPersistent()) {
      const clientResponse = await this._sdk.createClient(roomId, {
        clientId: clientID,
        clientName: clientName,
      });

      if (clientResponse.code > 299) {
        throw new Error(clientResponse.message);
      }

      return {
        clientID: clientResponse.data.clientId,
        name: clientResponse.data.name,
        roomID: roomId,
      };
    }

    const roomData = await this._roomRepo.getRoomById(roomId);

    if (!roomData) {
      throw new Error('room not found');
    }

    const clientResponse = await this._sdk.createClient(roomData?.id, {
      clientId: clientID,
      clientName: clientName,
    });

    const getClient = await this._participantRepo.getByClientID(
      clientResponse.data.clientId || clientID
    );

    if (getClient) {
      return getClient;
    }

    if (!clientResponse.data.clientId) {
      throw new Error(
        'Failed to add client to the meeting room. Please try again later!'
      );
    }

    const data: Participant = {
      clientID: clientResponse.data.clientId,
      name: clientResponse.data.name,
      roomID: roomId,
    };

    return await this._participantRepo.addParticipant(data);
  }

  async updateClientName(
    roomID: string,
    clientID: string,
    name: string
  ): Promise<Participant> {
    const updateResp = await this._sdk.updateClientName(roomID, clientID, name);

    if (updateResp.code > 499) {
      throw new Error(
        'an error has occured on our side please try again later'
      );
    }

    if (updateResp.code > 299) {
      throw new Error(updateResp.message);
    }

    return {
      clientID: updateResp.data.clientId,
      name: updateResp.data.name,
      roomID: roomID,
    };
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
