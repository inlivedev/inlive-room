type RoomContainerProps = {
  roomId: string;
  clientId: string;
};

type RoomLayoutProps = {
  roomId: string;
  clientId: string;
  streams: RoomStreamsStateType | null;
  room: Room | null;
};

type StreamStateType = {
  data: MediaStream;
  type: 'local' | 'remote';
  source: string;
};

type RoomStreamsStateType = {
  [key: string]: StreamStateType;
};

type RoomContextType = {
  streams: RoomStreamsStateType | null;
  room: Room | null;
};
