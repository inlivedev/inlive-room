'use client';

import Header from '@/_shared/components/header/header';
import Footer from '@/_shared/components/footer/footer';
import { EventType } from '@/_shared/types/event';
import Link from 'next/link';
import { Button } from '@nextui-org/react';
import { EventCard } from './event-card';
import EditIcon from '@/_shared/components/icons/edit-icon';
import ChevronLeft from '@/_shared/components/icons/chevron-left';
import ChevronRight from '@/_shared/components/icons/chevron-right';
import type { SVGElementPropsType } from '@/_shared/types/types';

const navLinks = [
  {
    title: 'My Events',
    href: '/event',
    active: true,
  },
];

export default function EventList({ events }: { events: EventType.Event[] }) {
  return (
    <div className="bg-zinc-900">
      <div className="min-viewport-height mx-auto flex h-full w-full max-w-5xl flex-1 flex-col  px-4">
        <Header logoText="inLive Room" logoHref="/" />
        <main className="flex-1">
          <nav className="border-b border-zinc-800 text-sm font-medium">
            <ul className="flex items-center">
              {navLinks.map((link) => {
                return (
                  <li
                    key={link.href}
                    className={`relative py-2 ${
                      link.active
                        ? 'after:absolute after:bottom-0 after:left-1/2 after:inline-block after:h-[2px] after:w-3/4 after:-translate-x-1/2 after:bg-white'
                        : ''
                    }`}
                  >
                    <Button
                      as={Link}
                      href={link.href}
                      className="h-8 w-full min-w-0 items-center rounded bg-transparent px-3 py-1.5 font-medium antialiased hover:bg-zinc-800 active:bg-zinc-700"
                    >
                      {link.title}
                    </Button>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="fixed bottom-0 left-0 z-20 w-full border-t border-zinc-700 bg-zinc-900 px-4 pb-6 pt-4 lg:relative lg:z-0 lg:mt-5 lg:border-t-0 lg:p-0 lg:text-right">
            <Button
              as={Link}
              href="/event/create"
              className="w-full min-w-0 rounded-lg bg-red-700 px-6 py-2 text-base font-medium antialiased hover:bg-red-600 active:bg-red-500 lg:w-auto"
            >
              <div className="flex items-center gap-2">
                <EditIcon height={20} width={20} />
                <span>Create a new event</span>
              </div>
            </Button>
          </div>
          <div className="mt-5 pb-28 lg:pb-20">
            {events.length ? (
              <>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {events.map((event) => {
                    return <EventCard key={event.id} event={event} />;
                  })}
                </div>
              </>
            ) : (
              <div className="flex h-60 w-full items-center justify-center rounded border border-zinc-800">
                <div className="text-center">
                  <div className="flex justify-center">
                    <EventCalendarIcon width={40} height={40} />
                  </div>
                  <b className="mt-3 block text-lg font-semibold capitalize">
                    We&apos;ll keep your events here
                  </b>
                  <p className="mt-1.5 text-sm text-zinc-400">
                    Come back to this page once you create your event.
                  </p>
                  <div className="mt-6">
                    <Button
                      as={Link}
                      href="/event/create"
                      className="h-8 min-w-0 rounded bg-red-700 px-4 py-1.5 text-sm font-medium antialiased hover:bg-red-600 active:bg-red-500"
                    >
                      Create event
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
        <div className="hidden lg:block">
          <Footer />
        </div>
      </div>
    </div>
  );
}

function EventCalendarIcon(props: SVGElementPropsType) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="M17.75 3A3.25 3.25 0 0 1 21 6.25v11.5A3.25 3.25 0 0 1 17.75 21H6.25A3.25 3.25 0 0 1 3 17.75V6.25A3.25 3.25 0 0 1 6.25 3h11.5Zm1.75 5.5h-15v9.25c0 .966.784 1.75 1.75 1.75h11.5a1.75 1.75 0 0 0 1.75-1.75V8.5Zm-11.75 6a1.25 1.25 0 1 1 0 2.5a1.25 1.25 0 0 1 0-2.5Zm4.25 0a1.25 1.25 0 1 1 0 2.5a1.25 1.25 0 0 1 0-2.5Zm-4.25-4a1.25 1.25 0 1 1 0 2.5a1.25 1.25 0 0 1 0-2.5Zm4.25 0a1.25 1.25 0 1 1 0 2.5a1.25 1.25 0 0 1 0-2.5Zm4.25 0a1.25 1.25 0 1 1 0 2.5a1.25 1.25 0 0 1 0-2.5Zm1.5-6H6.25A1.75 1.75 0 0 0 4.5 6.25V7h15v-.75a1.75 1.75 0 0 0-1.75-1.75Z"
      />
    </svg>
  );
}
