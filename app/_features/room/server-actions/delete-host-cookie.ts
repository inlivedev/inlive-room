'use server';
import { cookies } from 'next/headers';

export const deleteHostCookie = async () => {
  const cookieStore = cookies();

  if (cookieStore.get('host')) {
    cookieStore.delete('host');
  }
};
