export const Participant = () => {
  const participants = new Map<string, RoomParticipantTypes.Participant>();

  return {
    addParticipant(key: string, value: RoomParticipantTypes.Participant) {
      if (key.trim().length > 0) {
        participants.set(key, value);
      }
    },

    removeParticipant(key: string) {
      if (key.trim().length > 0) {
        participants.delete(key);
      }
    },

    getAllParticipants() {
      return [...participants.values()];
    },

    getParticipant(key: string) {
      return participants.get(key);
    },

    getTotalParticipants() {
      return participants.size;
    },
  };
};
