export type Stream = {
  origin: 'local' | 'remote';
  source: 'media' | 'screen';
  stream: MediaStream;
};

export as namespace RoomStreamType;
