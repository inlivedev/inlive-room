import { RoomRepo } from '@/(server)/_features/room/repository';
import { service } from '@/(server)/_features/room/service';
import { getCurrentAuthenticated } from '@/(server)/_shared/utils/auth';
import { ParticiantRepo } from '../participants/repository';

export interface iRoomService {
  createRoom(userID: number): Promise<Room>;
  joinRoom(roomId: string): Promise<Room | undefined>;
  createClient(roomId: string, name: string): Promise<Participant>;
}

export interface Room {
  id: string; //InLive Room ID
  name?: string | null;
  roomId: string; //InLive Hub Room ID (External)
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
  };

  return {
    createInstance: (roomService: iRoomService) => {
      const roomRoutesHandler = new roomHandler(roomService);

      return {
        createRoomHandler: roomRoutesHandler.createRoomHandler,
        joinRoomHandler: roomRoutesHandler.joinRoomHandler,
        registerClientHandler: roomRoutesHandler.registerClientHandler,
      };
    },
  };
};

export const roomRoutesHandler = createRoomRoutesHandler().createInstance(
  new service(new RoomRepo(), new ParticiantRepo())
);
