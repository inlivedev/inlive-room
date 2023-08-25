'use client';
import { useEffect } from 'react';
import { deleteHostCookie } from '@/_features/room/server-actions/cookie-action';

export default function CookieContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    deleteHostCookie();
  }, []);

  return <>{children}</>;
}
