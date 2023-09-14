import { ServerDataStore } from "@/(server)/_features/room/datastore";
import { service } from "@/(server)/_features/room/create";
import { getUserFromToken } from "@/(server)/_shared/utils/auth";
import { room } from "@/_shared/utils/sdk";

const createRoomRoutesHandler = () => {
  const roomHandler = class {
    roomService: service;

    constructor(roomService: service) {
      this.roomService = roomService;
    }

    createRoomHandler = async (token: string) => {
      const userData = await getUserFromToken(token);

      if (!userData) {
        throw new Error("failed to get user data");
      }

      const roomData = await room.createRoom();
      //   const clientData = await room.createClient(roomData.data.roomId);

      this.roomService.createRoom(
        { id: roomData.data.roomId, createdBy: userData.id },
      );
    };
  };

  return {
    createInstance: (roomService: service) => {
        const roomRoutesHandler = new roomHandler(roomService)

        return{
            createRoomHandler : roomRoutesHandler.createRoomHandler
        }
    },
  };
};

export const roomRoutesHandler = createRoomRoutesHandler().createInstance(new service(new ServerDataStore()))
