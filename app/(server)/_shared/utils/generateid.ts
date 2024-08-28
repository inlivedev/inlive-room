import { customAlphabet } from 'nanoid';
import { nolookalikesSafe } from 'nanoid-dictionary';

export const generateID = (lenght?: number): (() => string) => {
  if (lenght === undefined) {
    lenght = 12;
  }
  return customAlphabet(nolookalikesSafe, lenght);
};
