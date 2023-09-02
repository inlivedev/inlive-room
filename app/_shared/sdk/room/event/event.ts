export const createEvent = () => {
  const Event = class {
    _events: RoomEventType.EventItems;

    constructor() {
      this._events = {};
    }

    emit = (eventName = '', data = {}) => {
      if (typeof eventName !== 'string' || eventName.trim().length === 0) {
        throw new Error('Valid string for event name is required');
      }

      const event = this._events[eventName];

      if (event instanceof Set) {
        for (const callback of event) {
          typeof callback === 'function' && callback(data);
        }
      }
    };

    on = (eventName: string, callback: (event: any) => any) => {
      if (typeof eventName !== 'string' || eventName.trim().length === 0) {
        throw new Error('Valid string for event name is required');
      }

      const event = this._events[eventName];

      if (!(event instanceof Set)) {
        this._events[eventName] = new Set();
      }

      this._events[eventName].add(callback);
    };
  };

  return {
    createInstance: () => {
      const event = new Event();

      return {
        emit: event.emit,
        on: event.on,
      };
    },
  };
};
