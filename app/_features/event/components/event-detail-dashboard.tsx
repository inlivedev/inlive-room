'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@nextui-org/react';
import Header from '@/_shared/components/header/header';
import Footer from '@/_shared/components/footer/footer';

export default function EventDetailDashboard({}) {
  return (
    <div className="bg-zinc-900">
      <div className="min-viewport-height mx-auto flex max-w-7xl flex-col px-4">
        <Header logoText="inLive Room" logoHref="/" />
        <main className="mb-28 flex-1">
          <div className="lg:px-5">
            <div className="lg:-ml-5">
              <Button
                as={Link}
                href="/events"
                className="inline-flex min-w-0 gap-2 rounded-lg bg-transparent py-2 pl-3 pr-4 text-sm font-medium text-white antialiased hover:bg-zinc-800 active:bg-zinc-700 lg:text-base"
              >
                <span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 12h14M5 12l6 6m-6-6l6-6"
                    />
                  </svg>
                </span>
                <span>Back to my events list</span>
              </Button>
            </div>
            <div className="border-b border-zinc-800 py-4 lg:py-6">
              <span className="mb-2 block text-sm font-medium text-zinc-500 md:-mb-5">
                Free event
              </span>
              <div className="flex flex-col gap-2 md:flex-row md:justify-between md:gap-5">
                <div className="md:order-2">
                  <Image
                    referrerPolicy="no-referrer"
                    src="/images/webinar/webinar-no-image-placeholder.png"
                    alt={`Thumbnail image of `}
                    loading="lazy"
                    width={160}
                    height={80}
                    className="rounded object-cover"
                    unoptimized
                  />
                </div>
                <div className="md:order-1 md:flex-1 md:pt-7">
                  <h3 className="text-base font-medium text-zinc-300 lg:text-lg">
                    Developing Real-Time Communication Features with WebRTC and
                    SFU
                  </h3>
                  <span className="mt-2 inline-block text-sm font-medium text-zinc-500">
                    7 December 2023, 10:00am
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-1 py-3 sm:flex-row sm:gap-8 lg:py-6">
              <div className="text-sm font-medium text-zinc-400">
                Created on 1 December 2023
              </div>
              <div className="text-sm font-medium text-zinc-400">
                Published on 2 December 2023
              </div>
            </div>
          </div>
        </main>
        <div className="hidden lg:block">
          <Footer />
        </div>
      </div>
    </div>
  );
}
