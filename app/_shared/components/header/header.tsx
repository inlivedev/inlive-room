'use client';

import Image from 'next/image';
import Link from 'next/link';
import Profile from '@/_shared/components/header/profile';
import { useAuthContext } from '@/_shared/contexts/auth';

export default function Header({
  logoText,
  logoHref,
}: {
  logoText: string;
  logoHref: string;
}) {
  const { user } = useAuthContext();

  const openSignInModal = () => {
    document.dispatchEvent(new CustomEvent('open:sign-in-modal'));
  };

  return (
    <header className="w-full py-6 lg:py-12">
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center">
          <Link
            href={logoHref}
            className="inline-flex items-center justify-center gap-1.5"
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
        </div>
        <div className="flex items-center">
          <div className="relative">
            <Link
              href="/events"
              className="block text-sm font-semibold text-zinc-100 no-underline underline-offset-2 active:underline"
            >
              Events
            </Link>
            <div className="absolute left-0 top-[-17px] inline-flex items-center">
              <span className="leading-2 rounded-sm border-1 border-emerald-800 bg-emerald-950 px-1 text-[9px] font-medium text-emerald-300">
                Beta
              </span>
            </div>
          </div>
          <div className="mx-4 sm:mx-5">
            <hr className="h-6 w-px border-none bg-zinc-600" />
          </div>
          {user ? (
            <Profile user={user} />
          ) : (
            <button
              className="text-sm font-semibold text-zinc-100 underline-offset-2 active:underline"
              onClick={openSignInModal}
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
