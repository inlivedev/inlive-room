import { customAlphabet } from 'nanoid';
import { nolookalikesSafe } from 'nanoid-dictionary';

export const generateID = (lenght?: number) => {
  if (lenght === undefined) {
    lenght = 12;
  }
  const nanoid = customAlphabet(nolookalikesSafe, lenght);
  return nanoid();
};
