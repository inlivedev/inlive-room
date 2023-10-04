import { RoomRepo } from '@/(server)/_features/room/repository';
import { service } from '@/(server)/_features/room/service';
import { getCurrentAuthenticated } from '@/(server)/_shared/utils/auth';
import { ParticiantRepo } from '../participants/repository';

export interface iRoomService {
  createRoom(userID: number): Promise<Room>;
  joinRoom(roomId: string): Promise<Room | undefined>;
  createClient(roomId: string, name: string): Promise<Participant>;
  getClients(roomID: string, clientIDs: string[]): Promise<Participant[]>;
  getAllClients(roomID: string): Promise<Participant[]>;
}

export interface Room {
  id: string; //InLive Room ID
  name?: string | null;
  externalID: string; //InLive Hub Room ID (External)
  createdBy: number;
}

export interface Participant {
  clientID: string;
  name: string;
  roomID: string | null;
}

const createRoomRoutesHandler = () => {
  const roomHandler = class {
    roomService: iRoomService;

    constructor(roomService: iRoomService) {
      this.roomService = roomService;
    }

    createRoomHandler = async (token: string) => {
      const response = await getCurrentAuthenticated(token);
      return this.roomService.createRoom(response.data.id);
    };

    joinRoomHandler = async (roomID: string) => {
      return await this.roomService.joinRoom(roomID);
    };

    registerClientHandler = async (roomID: string, name: string) => {
      return await this.roomService.createClient(roomID, name);
    };

    getClientHandler = async (roomID: string, clientIDs: string[]) => {
      return await this.roomService.getClients(roomID, clientIDs);
    };

    getAllClientHandler = async (roomID: string) => {
      return await this.roomService.getAllClients(roomID);
    };
  };

  return {
    createInstance: (roomService: iRoomService) => {
      const roomRoutesHandler = new roomHandler(roomService);

      return {
        createRoomHandler: roomRoutesHandler.createRoomHandler,
        joinRoomHandler: roomRoutesHandler.joinRoomHandler,
        registerClientHandler: roomRoutesHandler.registerClientHandler,
        getClientHandler: roomRoutesHandler.getClientHandler,
        getAllClientHandler: roomRoutesHandler.getAllClientHandler,
      };
    },
  };
};

export const roomRoutesHandler = createRoomRoutesHandler().createInstance(
  new service(new RoomRepo(), new ParticiantRepo())
);
