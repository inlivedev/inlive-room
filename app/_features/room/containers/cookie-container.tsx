'use client';
import { useEffect } from 'react';
import { deleteHostCookie } from '@/_features/room/server-actions/delete-host-cookie';

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
