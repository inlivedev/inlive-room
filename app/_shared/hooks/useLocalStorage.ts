import { useState, useEffect } from 'react';

export const useLocalStorage = <T>(storageKey: string, initialValue: T) => {
  const [state, setState] = useState(initialValue);

  useEffect(() => {
    const value = window.localStorage.getItem(storageKey);
    if (value) {
      const parsed: any = JSON.parse(JSON.stringify(value));
      setState(parsed);
    }
  }, [storageKey, setState]);

  const setValue = (value: T) => {
    if (typeof window !== undefined && value) {
      const valueToStore = value instanceof Function ? value(state) : value;
      window.localStorage.setItem(storageKey, JSON.stringify(valueToStore));
      setState(valueToStore);
    }
  };

  const result: { value: T; setValue: (value: T) => void } = {
    value: state,
    setValue,
  };

  return result;
};
