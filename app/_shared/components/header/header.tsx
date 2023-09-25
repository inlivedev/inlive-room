'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@nextui-org/react';

export default function Header() {
  const openSignInModal = () => {
    document.dispatchEvent(new CustomEvent('open:sign-in-modal'));
  };

  return (
    <header className="w-full py-6 lg:py-8">
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center">
          <Link
            href="/"
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
              inLive Room
            </h1>
          </Link>
        </div>
        <div>
          <Button
            variant="flat"
            size="sm"
            className="bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 sm:h-unit-9 sm:w-unit-20 sm:px-4 sm:text-sm"
            onClick={openSignInModal}
          >
            Sign In
          </Button>
        </div>
      </div>
    </header>
  );
}
