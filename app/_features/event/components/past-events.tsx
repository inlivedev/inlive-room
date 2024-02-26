'use client';

import Image from 'next/image';
import Header from '@/_shared/components/header/header';
import Footer from '@/_shared/components/footer/footer';
import TabNavigation from '@/_features/event/components/tab-navigation';

const navLinks = [
  {
    title: 'My Events',
    href: '/event',
  },
  {
    title: 'Past Events',
    href: '/past-events',
  },
];

export default function PastEvents() {
  return (
    <div className="bg-zinc-900">
      <div className="min-viewport-height mx-auto flex h-full w-full max-w-7xl flex-1 flex-col  px-4">
        <Header logoText="inLive Room" logoHref="/" />
        <main className="flex-1">
          <TabNavigation navLinks={navLinks} />
          <div className="mt-5 pb-5 md:pb-10">
            <ul className="flex flex-col gap-10">
              <PastEvent />
              <PastEvent />
            </ul>
          </div>
        </main>
        <div>
          <Footer />
        </div>
      </div>
    </div>
  );
}

function PastEvent() {
  return (
    <li className="flex flex-col gap-4 rounded-3xl border border-zinc-800 px-4 py-5 sm:p-5">
      <div className="flex flex-col gap-5 sm:flex-row sm:justify-between">
        <div className="max-w-none sm:order-2 sm:max-w-60 md:max-w-40">
          <Image
            referrerPolicy="no-referrer"
            src="https://dev-room.inlive.app/images/webinar/webinar-no-image-placeholder.png"
            alt={`Thumbnail image of `}
            loading="lazy"
            width={160}
            height={80}
            style={{ objectFit: 'cover' }}
            className="w-full rounded"
            unoptimized
          />
        </div>
        <div className="flex flex-col justify-between sm:order-1">
          <h3 className="text-lg font-medium text-zinc-300">
            Philippines Sales Community – Pipedrive Virtual Meetup
          </h3>
          <div className="mt-1">
            <span className="text-sm font-medium text-zinc-500">
              Dec 21, 7:30pm
            </span>
          </div>
        </div>
      </div>
      <div className="border-t border-zinc-800 pb-2 pt-4">
        <StatList>
          <StatItem name="Registered users" value={200} />
          <StatItem name="Joined users" value={100} />
          <StatItem name="Joined as guest" value={70} />
          <StatItem name="Percentage guest" value="70%" />
          <StatItem name="Percentage joined" value="50%" />
          <StatItem name="Duration" value="1 hr 7 min" />
          <StatItem name="Shared screen" value="25 min" />
          <StatItem name="Chat messages" value={18} />
        </StatList>
      </div>
    </li>
  );
}

function StatList({ children }: { children?: React.ReactNode }) {
  return <ul className="grid grid-cols-2 gap-8 md:grid-cols-4">{children}</ul>;
}

function StatItem({ name, value }: { name: string; value: number | string }) {
  return (
    <li>
      <dl className="flex flex-col gap-1">
        <dt className="text-sm font-semibold text-zinc-400">{name}</dt>
        <dd className="text-2xl font-semibold tabular-nums leading-6 text-zinc-200">
          {value}
        </dd>
      </dl>
    </li>
  );
}
