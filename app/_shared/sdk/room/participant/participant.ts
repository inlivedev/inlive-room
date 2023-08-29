class Participant {
  _participants;

  constructor() {
    this._participants = new Map<string, RoomParticipantTypes.Participant>();
  }

  addParticipant(key: string, value: RoomParticipantTypes.Participant) {
    if (key.trim().length > 0) {
      this._participants.set(key, value);
    }
  }

  removeParticipant(key: string) {
    if (key.trim().length > 0) {
      this._participants.delete(key);
    }
  }

  getAllParticipants() {
    return [...this._participants.values()];
  }

  getParticipant(key: string) {
    return this._participants.get(key);
  }

  getTotalParticipants() {
    return this._participants.size;
  }
}

export const participantFactory = () => {
  const {
    addParticipant,
    removeParticipant,
    getAllParticipants,
    getParticipant,
    getTotalParticipants,
  } = new Participant();

  return {
    addParticipant,
    removeParticipant,
    getAllParticipants,
    getParticipant,
    getTotalParticipants,
  };
};
