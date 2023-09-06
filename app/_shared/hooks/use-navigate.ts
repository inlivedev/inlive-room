import { useCallback } from 'react';
import type { NavigateOptions } from 'next/dist/shared/lib/app-router-context';
import { useRouter } from 'next/navigation';

export const useNavigate = () => {
  const router = useRouter();

  const navigateTo = useCallback(
    (path: string, options: NavigateOptions = {}) => {
      router.push(path, options);
      router.refresh();
    },
    [router]
  );

  const prefetch = useCallback(
    (path: string) => {
      router.prefetch(path);
    },
    [router]
  );

  return { navigateTo, prefetch };
};
