export type Participant = {
  stream: MediaStream;
  type: 'local' | 'display' | 'remote';
};

export as namespace RoomParticipantTypes;
