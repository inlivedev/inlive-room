'use client';

import { type Key } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  useDisclosure,
} from '@nextui-org/react';
import Header from '@/_shared/components/header/header';
import Footer from '@/_shared/components/footer/footer';
import {
  StatusPublished,
  StatusCancelled,
} from '@/_features/event/components/event-status';
import type { EventType } from '@/_shared/types/event';
import { copyToClipboard } from '@/_shared/utils/copy-to-clipboard';
import { webShare } from '@/_shared/utils/web-share';
import { useToggle } from '@/_shared/hooks/use-toggle';
import CancelEventModal from './event-cancel-modal';
import type { SVGElementPropsType } from '@/_shared/types/types';
import { useFormattedDateTime } from '@/_shared/hooks/use-formatted-datetime';

const APP_ORIGIN = process.env.NEXT_PUBLIC_APP_ORIGIN;

export default function EventDetailDashboard({
  event,
  registerees,
}: {
  event: EventType.Event;
  registerees: EventType.Registeree[];
}) {
  const thumbnailUrl = event.thumbnailUrl
    ? `${APP_ORIGIN}/static${event.thumbnailUrl}`
    : '/images/webinar/webinar-no-image-placeholder.png';

  const startDate = useFormattedDateTime(event.startTime, 'en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const startTime = useFormattedDateTime(event.startTime, 'en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const createdDate = useFormattedDateTime(event.createdAt, 'en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="bg-zinc-900">
      <CancelEventModal slug={event.slug} />
      <div className="min-viewport-height mx-auto flex max-w-7xl flex-col px-4">
        <Header logoText="inLive Room" logoHref="/" />
        <main className="flex-1">
          <div
            className={`${
              event.status === 'published' ? 'pb-28 lg:pb-0' : 'pb-5'
            }`}
          >
            <div className="lg:px-5">
              <div className="flex items-center justify-between lg:-ml-5">
                <div>
                  <Button
                    as={Link}
                    href="/events"
                    className="inline-flex min-w-0 gap-2 rounded-lg bg-transparent py-2 pl-3 pr-4  antialiased hover:bg-zinc-800 active:bg-zinc-700"
                  >
                    <span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 lg:h-6 lg:w-6"
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
                    <span className="text-sm font-medium text-white lg:text-base">
                      Back to my events list
                    </span>
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  {event.status === 'published' ? (
                    <div className="fixed bottom-0 left-0 z-20 w-full border-t border-zinc-700 bg-zinc-900 px-4 pb-6 pt-4 lg:relative lg:z-0 lg:w-auto lg:border-0 lg:bg-transparent lg:p-0">
                      <div className="flex items-center justify-center gap-4">
                        <div className="flex-1 lg:order-2 lg:flex-auto">
                          <Button
                            as={Link}
                            href={`/events/${event.slug}`}
                            target="_blank"
                            className="h-9 w-full min-w-0 rounded-md bg-zinc-800 px-4 py-2 text-base font-medium text-white antialiased hover:bg-zinc-700 active:bg-zinc-600 lg:text-sm"
                          >
                            View Event Page
                          </Button>
                        </div>
                        <div className="flex-1 lg:order-1 lg:flex-auto">
                          <Button
                            as={Link}
                            href={`/rooms/${event.roomId}`}
                            target="_blank"
                            className="h-9 w-full min-w-0 rounded-md bg-red-700 px-4 py-2 text-base font-medium text-white antialiased hover:bg-red-600 active:bg-red-500 lg:text-sm"
                          >
                            Join Webinar
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : null}
                  <MoreDropdown
                    title={event.name}
                    slug={event.slug}
                    status={event.status}
                  />
                </div>
              </div>
              <div className="border-b border-zinc-800 py-4 lg:py-6">
                <div className="mb-3 flex items-center md:-mb-5">
                  {event.status === 'published' && <StatusPublished />}
                  {event.status === 'cancelled' && <StatusCancelled />}
                  <span className="ml-3 inline-block text-sm font-medium text-zinc-500">
                    Free event
                  </span>
                </div>
                <div className="flex flex-col gap-2 md:flex-row md:justify-between md:gap-5">
                  <div className="md:order-2">
                    <Image
                      referrerPolicy="no-referrer"
                      src={thumbnailUrl}
                      alt={`Thumbnail image of ${event.name}`}
                      loading="lazy"
                      width={160}
                      height={80}
                      className="rounded object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="md:order-1 md:flex-1 md:pt-7">
                    <h3 className="text-base font-medium text-zinc-300 lg:text-lg">
                      {event.name}
                    </h3>
                    <span className="mt-2 inline-block text-sm font-medium text-zinc-500">
                      <span>{startDate}</span>,&nbsp;
                      <span className="lowercase">{startTime}</span>
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-1 py-3 sm:flex-row sm:gap-8 lg:py-5">
                <div className="text-sm font-medium text-zinc-400">
                  Created on {createdDate}
                </div>
              </div>
            </div>
            <div className="mt-2 lg:mt-8">
              <nav className="-ml-4 w-[calc(100%+2rem)] border-b border-zinc-800 px-4 text-sm font-medium lg:px-5">
                <ul className="flex items-center">
                  <li className="relative py-2">
                    <div className="h-8 w-full px-2 py-1.5 font-medium antialiased lg:px-3">
                      Participants
                    </div>
                    <div className="absolute bottom-0 left-1/2 inline-block h-[2px] w-3/4 -translate-x-1/2 bg-white"></div>
                  </li>
                </ul>
              </nav>
              <div className="mt-4 pt-2.5 lg:mt-2 lg:px-5 lg:pt-2">
                <div className="text-xs font-medium text-zinc-400 lg:text-base">
                  <span className="tabular-nums">
                    {registerees.length || 0}
                  </span>{' '}
                  participants
                </div>
                <div className="relative mt-4 block max-h-[400px] overflow-auto overscroll-contain">
                  <table className="w-full table-auto divide-y divide-zinc-700 text-left">
                    <thead className="sticky top-0 bg-zinc-800 leading-5 text-zinc-300">
                      <tr>
                        <th
                          scope="col"
                          className="whitespace-nowrap px-3 py-2 text-xs font-medium lg:px-6 lg:py-3"
                        >
                          Name
                        </th>
                        <th
                          scope="col"
                          className="whitespace-nowrap px-3 py-2 text-xs font-medium lg:px-6 lg:py-3"
                        >
                          Email
                        </th>
                        <th
                          scope="col"
                          className="whitespace-nowrap px-3 py-2 text-xs font-medium lg:px-6 lg:py-3"
                        >
                          Registered At
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-700 text-sm">
                      {registerees.length > 0 ? (
                        registerees.map((registeree) => {
                          return (
                            <RegistereeItem
                              key={`${registeree.id}-${registeree.email}`}
                              registeree={registeree}
                            />
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={3}>
                            <div className="flex items-center justify-center p-3 text-zinc-200 lg:p-6">
                              Empty data
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </main>
        <div
          className={event.status === 'published' ? 'hidden lg:block' : 'block'}
        >
          <Footer />
        </div>
      </div>
    </div>
  );
}

function RegistereeItem({ registeree }: { registeree: EventType.Registeree }) {
  const name = `${registeree.firstName} ${registeree.lastName}`;

  const registeredDate = useFormattedDateTime(registeree.createdAt, 'en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const registeredTime = useFormattedDateTime(registeree.createdAt, 'en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <tr>
      <th
        scope="row"
        className="min-w-52 max-w-80 truncate whitespace-nowrap p-3 font-medium text-zinc-200 lg:p-6"
      >
        {name}
      </th>
      <td className="min-w-52 max-w-80 truncate whitespace-nowrap p-3 text-zinc-400 lg:p-6">
        {registeree.email}
      </td>
      <td className="min-w-52 max-w-80 truncate whitespace-nowrap p-3 text-zinc-400 lg:p-6">
        <span>{registeredDate}</span>,&nbsp;
        <span className="lowercase">{registeredTime}</span>
      </td>
    </tr>
  );
}

function MoreIcon(props: SVGElementPropsType) {
  return (
    <svg
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM12.5 8.625C13.1213 8.625 13.625 8.12132 13.625 7.5C13.625 6.87868 13.1213 6.375 12.5 6.375C11.8787 6.375 11.375 6.87868 11.375 7.5C11.375 8.12132 11.8787 8.625 12.5 8.625Z"
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
      ></path>
    </svg>
  );
}

function MoreDropdown({
  title,
  slug,
  status,
}: {
  title: string;
  slug: string;
  status: 'draft' | 'published' | 'cancelled';
}) {
  const { isOpen, onOpenChange, onClose } = useDisclosure();

  const supportWebShare =
    typeof window !== 'undefined' &&
    typeof window?.navigator?.canShare !== 'undefined' &&
    typeof window?.navigator?.share !== 'undefined';

  const {
    active: copiedActive,
    setActive: setCopiedActive,
    setInActive: setCopiedInActive,
  } = useToggle(false);

  const handleCopyLink = async (text = '') => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedActive();
      setTimeout(() => {
        setCopiedInActive();
      }, 2000);
    } else {
      alert('Failed to copy URL');
    }
  };

  const onMoreActionSelection = async (selectedKey: Key) => {
    const eventURL = `${APP_ORIGIN}/events/${slug}`;

    if (selectedKey === 'copy') {
      await handleCopyLink(eventURL);
    } else if (selectedKey === 'share' && supportWebShare) {
      const shareTitle = `Webinar — ${title} — inLive Room`;
      await webShare(eventURL, shareTitle);
    } else if (selectedKey === 'cancel') {
      onClose();
      document.dispatchEvent(new CustomEvent('open:event-cancel-modal'));
    }
  };

  return (
    <Dropdown
      className="min-w-40 ring-1 ring-zinc-800"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      closeOnSelect={false}
    >
      <DropdownTrigger>
        <Button className="h-9 min-w-0 rounded-md bg-transparent px-4 py-2 text-white hover:bg-zinc-800 active:bg-zinc-700 lg:bg-zinc-800 lg:hover:bg-zinc-700 lg:active:bg-zinc-600">
          <MoreIcon className="h-4 w-4" />
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        disallowEmptySelection
        onAction={onMoreActionSelection}
        aria-label="More options"
      >
        {[
          <DropdownItem key="copy" textValue="Copy event link">
            <span>{copiedActive ? 'Copied!' : 'Copy Event Link'}</span>
          </DropdownItem>,
          // @ts-ignore
          supportWebShare ? (
            <DropdownItem key="share" textValue="Share event">
              <span className="text-zinc-200">Share Event</span>
            </DropdownItem>
          ) : undefined,
          // @ts-ignore
          status === 'published' ? (
            <DropdownItem key="cancel" textValue="Cancel event">
              <span className="text-red-400">Cancel Event</span>
            </DropdownItem>
          ) : undefined,
        ]}
      </DropdownMenu>
    </Dropdown>
  );
}
