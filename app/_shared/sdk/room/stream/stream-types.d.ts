export type Stream = {
  origin: 'local' | 'remote';
  source: 'media' | 'screen';
  mediaStream: MediaStream;
};

export type DraftStream = {
  origin?: Stream['origin'];
  source?: Stream['source'];
  mediaStream?: Stream['stream'];
};

export as namespace RoomStreamType;
