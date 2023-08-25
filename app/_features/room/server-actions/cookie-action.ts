'use server';
import { cookies } from 'next/headers';

export const getHostCookie = () => {
  const cookieStore = cookies();
  const host = cookieStore.get('host');
  return !!host;
};

export const deleteHostCookie = async () => {
  const cookieStore = cookies();

  if (cookieStore.get('host')) {
    cookieStore.delete('host');
  }
};
