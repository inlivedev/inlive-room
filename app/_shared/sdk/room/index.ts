import { createInstanceFacade } from './facade/facade';

const createRoom = (
  createInstanceFacade: RoomFacadeType.CreateInstanceFacade
) => {
  return (config: RoomType.UserConfig) => {
    return createInstanceFacade(config);
  };
};

export const Room = createRoom(createInstanceFacade);
