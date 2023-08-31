export type Stream = {
  origin: 'local' | 'remote';
  source: 'media' | 'screen';
  stream: MediaStream;
};

export type DraftStream = {
  origin?: Stream['origin'];
  source?: Stream['source'];
  stream?: Stream['stream'];
};

export as namespace RoomStreamType;
