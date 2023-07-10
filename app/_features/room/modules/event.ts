type EventsType = {
  [key: string]: Set<(arg0: any) => void>;
};

export class EventManager {
  #events: EventsType;

  constructor() {
    this.#events = {};
  }

  #isInstanceOfSet(events: EventsType, eventName: string) {
    return events[eventName] instanceof Set;
  }

  emit(eventName = '', data = {}) {
    if (typeof eventName !== 'string' || eventName.trim().length === 0) {
      throw new Error('Valid string for event name is required');
    }

    if (this.#isInstanceOfSet(this.#events, eventName)) {
      for (const callback of this.#events[eventName]) {
        typeof callback === 'function' && callback(data);
      }
    }
  }

  on(eventName: string, callback: (event: any) => any) {
    if (typeof eventName !== 'string' || eventName.trim().length === 0) {
      throw new Error('Valid string for event name is required');
    }

    if (!this.#isInstanceOfSet(this.#events, eventName)) {
      this.#events[eventName] = new Set();
    }

    this.#events[eventName].add(callback);
  }
}
