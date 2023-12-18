import { nanoid } from 'nanoid';

export const generateID = (lenght?: number): string => {
  if (lenght === undefined) {
    lenght = 12;
  }
  return nanoid(lenght);
};
