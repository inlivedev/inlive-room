'use client';

import Image from 'next/image';
import Link from 'next/link';
import Profile from '@/_shared/components/header/profile';
import { useAuthContext } from '@/_shared/contexts/auth';

export default function Header({
  logoText,
  logoHref,
  needAuth = false,
}: {
  logoText: string;
  logoHref: string;
  needAuth?: boolean;
}) {
  const { user } = useAuthContext();

  const openSignInModal = () => {
    document.dispatchEvent(new CustomEvent('open:sign-in-modal'));
  };

  return (
    <header className="w-full py-6 lg:py-12">
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center">
          {needAuth && !user ? (
            <button
              className="inline-flex items-center justify-center gap-2"
              onClick={openSignInModal}
            >
              <Image
                src="/images/favicon/favicon.svg"
                alt="Icon Logo"
                className="h-6 w-6 lg:h-7 lg:w-7"
                width={28}
                height={28}
              />
              <h1 className="text-lg font-semibold tracking-wide lg:text-xl">
                {logoText}
              </h1>
            </button>
          ) : (
            <Link
              href={logoHref}
              className="inline-flex items-center justify-center gap-2"
            >
              <Image
                src="/images/favicon/favicon.svg"
                alt="Icon Logo"
                className="h-6 w-6 lg:h-7 lg:w-7"
                width={28}
                height={28}
              />
              <h1 className="text-lg font-semibold tracking-wide lg:text-xl">
                {logoText}
              </h1>
            </Link>
          )}
        </div>
        <div className="flex items-center">
          <Profile />
        </div>
      </div>
    </header>
  );
}
