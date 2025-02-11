import { headers } from 'next/headers';

export const getOriginServerSide = async () => {
  const headersList = await headers();
  const protocol =
    headersList.get('x-forwarded-proto')?.split(',')[0] || 'http';
  const host = headersList.get('x-forwarded-host') || headersList.get('host');
  const origin = `${protocol}://${host}`;
  return origin;
};
