'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@nextui-org/react';

type NavLinks = {
  title: string;
  href: string;
};

export default function TabNavigation({ navLinks }: { navLinks: NavLinks[] }) {
  const pathname = usePathname();

  return (
    <nav className="border-b border-zinc-800 text-sm font-medium">
      <ul className="flex items-center">
        {navLinks.map((link) => {
          const active = pathname.includes(link.href);
          return (
            <li key={link.href} className="relative py-2">
              <Button
                as={Link}
                href={link.href}
                className="h-8 w-full min-w-0 items-center rounded bg-transparent px-3 py-1.5 font-medium antialiased hover:bg-zinc-800 active:bg-zinc-700"
              >
                {link.title}
              </Button>
              {active ? (
                <div className="absolute bottom-0 left-1/2 inline-block h-[2px] w-3/4 -translate-x-1/2 bg-white"></div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
