export const Event = () => {
  const events: RoomEventTypes.Events = {};

  return {
    emit(eventName = '', data = {}) {
      if (typeof eventName !== 'string' || eventName.trim().length === 0) {
        throw new Error('Valid string for event name is required');
      }

      const event = events[eventName];

      if (event instanceof Set) {
        for (const callback of event) {
          typeof callback === 'function' && callback(data);
        }
      }
    },
    on(eventName: string, callback: (event: any) => any) {
      if (typeof eventName !== 'string' || eventName.trim().length === 0) {
        throw new Error('Valid string for event name is required');
      }

      const event = events[eventName];

      if (!(event instanceof Set)) {
        events[eventName] = new Set();
      }

      events[eventName].add(callback);
    },
  };
};
