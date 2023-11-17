'use client';

import Image from 'next/image';
import Link from 'next/link';
import Profile from '@/_shared/components/header/profile';

export default function Header({
  logoText,
  logoHref,
}: {
  logoText: string;
  logoHref: string;
}) {
  return (
    <header className="w-full py-6 lg:py-8">
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center">
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
        </div>
        <div className="flex items-center">
          <Profile />
        </div>
      </div>
    </header>
  );
}
