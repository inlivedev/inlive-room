import type { NavigateOptions } from 'next/dist/shared/lib/app-router-context';
import { useRouter } from 'next/navigation';

export const useNavigate = () => {
  const router = useRouter();

  const navigateTo = (path: string, options: NavigateOptions = {}) => {
    router.push(path, options);
    router.refresh();
  };

  return { navigateTo };
};
