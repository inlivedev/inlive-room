'use client';

import { type Key } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@nextui-org/react';
import Header from '@/_shared/components/header/header';
import Footer from '@/_shared/components/footer/footer';
import Link from 'next/link';
import type { EventType } from '@/_shared/types/event';
import { copyToClipboard } from '@/_shared/utils/copy-to-clipboard';
import { webShare } from '@/_shared/utils/web-share';
import { useToggle } from '@/_shared/hooks/use-toggle';
import ClockFillIcon from '@/_shared/components/icons/clock-fill-icon';
import CameraOnIcon from '@/_shared/components/icons/camera-on-icon';
import type { SVGElementPropsType } from '@/_shared/types/types';

const APP_ORIGIN = process.env.NEXT_PUBLIC_APP_ORIGIN;

export default function EventDetail({
  event,
  status,
  startDateWithYear,
  startDateWithoutYear,
  startTime,
  endTime,
}: {
  event: EventType.Event;
  status: 'draft' | 'public';
  startDateWithoutYear: string;
  startDateWithYear: string;
  startTime: string;
  endTime: string;
}) {
  const descriptionMarkup = {
    __html: event.description || '',
  };

  const thumbnailUrl = event.thumbnailUrl
    ? `${APP_ORIGIN}/static${event.thumbnailUrl}`
    : '/images/webinar/webinar-no-image-placeholder.png';

  return (
    <div className="bg-zinc-900">
      <div className="min-viewport-height mx-auto flex max-w-7xl flex-col px-4">
        <Header logoText="inLive Room" logoHref="/" />
        <main className="flex-1">
          <div className="pb-28 lg:pb-0">
            <div className="mb-0.5 flex items-center gap-4 lg:mb-0">
              <b className="font-semibold text-zinc-200">
                {startDateWithoutYear}
              </b>
            </div>
            <h2 className="text-wrap text-2xl font-bold tracking-wide text-zinc-100 lg:text-[42px] lg:leading-[52px]">
              {event.name}
            </h2>
            {typeof event.host?.name === 'string' ? (
              <b className="mt-4 block font-medium text-zinc-300 lg:mt-6">
                Hosted by {event.host.name}
              </b>
            ) : null}
            <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:gap-10">
              <div className="lg:order-2 lg:flex-1">
                <div className="flex w-full flex-col gap-6 rounded-2xl lg:sticky lg:top-6 lg:ml-auto lg:max-w-[440px] lg:bg-zinc-950/25 lg:p-8 lg:ring-1 lg:ring-zinc-800">
                  <div className="flex flex-col gap-4 lg:gap-6">
                    <div className="flex items-center gap-4 rounded-lg text-sm">
                      <span className="rounded-lg bg-zinc-700/60 p-2">
                        <ClockFillIcon
                          width={24}
                          height={24}
                          className="text-zinc-100"
                        />
                      </span>
                      <div>
                        <b className="font-semibold text-zinc-100">
                          {startDateWithYear}
                        </b>
                        <div className="mt-0.5 text-zinc-300">
                          {startTime} to {endTime}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 rounded-lg text-sm">
                      <span className="rounded-lg bg-zinc-700/60 p-2">
                        <CameraOnIcon
                          width={24}
                          height={24}
                          className="text-zinc-100"
                        />
                      </span>
                      <div>
                        <b className="font-semibold text-zinc-100">
                          Online webinar
                        </b>
                        <div className="mt-0.5 text-zinc-300">
                          Attendees will receive a link
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 rounded-lg text-sm">
                      <span className="rounded-lg bg-zinc-700/60 p-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                        >
                          <path
                            fill="currentColor"
                            d="M16 17v2H2v-2s0-4 7-4s7 4 7 4m-3.5-9.5A3.5 3.5 0 1 0 9 11a3.5 3.5 0 0 0 3.5-3.5m3.44 5.5A5.32 5.32 0 0 1 18 17v2h4v-2s0-3.63-6.06-4M15 4a3.39 3.39 0 0 0-1.93.59a5 5 0 0 1 0 5.82A3.39 3.39 0 0 0 15 11a3.5 3.5 0 0 0 0-7Z"
                          />
                        </svg>
                      </span>
                      <div>
                        <b className="font-semibold text-zinc-100">
                          No participant limit
                        </b>
                        <div className="mt-0.5 text-zinc-300">
                          Anyone can freely join this webinar
                        </div>
                      </div>
                    </div>
                  </div>
                  {status === 'draft' ? (
                    <DraftAction event={event} />
                  ) : (
                    <PublicAction event={event} />
                  )}
                </div>
              </div>
              <div className="w-full lg:order-1 lg:max-w-[640px] lg:flex-auto">
                <div className="max-w-[640px]">
                  <Image
                    referrerPolicy="no-referrer"
                    width={640}
                    height={320}
                    src={thumbnailUrl}
                    alt={`Thumbnail image of ${event.name}`}
                    style={{ aspectRatio: '2/1' }}
                    className="w-full rounded-3xl"
                    priority={true}
                    unoptimized
                  />
                </div>
                <div
                  className="prose prose-sm mt-6 max-w-none text-pretty text-zinc-200 lg:prose-base prose-img:rounded-2xl prose-img:lg:rounded-3xl"
                  dangerouslySetInnerHTML={descriptionMarkup}
                ></div>
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

function DraftAction({ event }: { event: EventType.Event }) {
  return (
    <div className="fixed bottom-0 left-0 z-20 w-full border-t border-zinc-700 bg-zinc-900 px-4 pb-6 pt-4 lg:relative lg:z-0 lg:w-auto lg:bg-transparent lg:px-0 lg:py-6">
      <div className="text-center">
        <Button
          href={`/events/${event.slug}/edit`}
          as={Link}
          className="w-full max-w-lg rounded-md bg-red-700 px-4 py-2 text-base font-medium antialiased hover:bg-red-600 active:bg-red-500"
        >
          Edit data
        </Button>
      </div>
    </div>
  );
}

function PublicAction({ event }: { event: EventType.Event }) {
  const EventRegistrationModal = dynamic(
    () => import('@/_features/event/components/event-registration-modal')
  );

  const openRegisterEventForm = () => {
    document.dispatchEvent(new CustomEvent('open:event-registration-modal'));
  };

  return (
    <>
      <EventRegistrationModal event={event} />
      <div className="fixed bottom-0 left-0 z-20 w-full border-t border-zinc-700 bg-zinc-900 px-4 pb-6 pt-4 lg:relative lg:z-0 lg:w-auto lg:bg-transparent lg:px-0 lg:py-6">
        <div className="flex items-center justify-center gap-4">
          <b className="text flex items-center text-base font-semibold uppercase tracking-wide text-white">
            Free
          </b>
          <ShareDropdown title={event.name} slug={event.slug} />
          <div className="flex-auto">
            <Button
              className="w-full rounded-md bg-red-700 px-4 py-2 text-base font-medium text-white antialiased hover:bg-red-600 active:bg-red-500"
              onClick={openRegisterEventForm}
            >
              Register to Attend
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

function ShareDropdown({ title, slug }: { title: string; slug: string }) {
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
      alert('Failed to copy link');
    }
  };

  const supportWebShare =
    typeof window !== 'undefined' &&
    typeof window?.navigator?.canShare !== 'undefined' &&
    typeof window?.navigator?.share !== 'undefined';

  const onShareOptionSelected = async (selectedKey: Key) => {
    if (selectedKey === 'copy') {
      await handleCopyLink(`${APP_ORIGIN}/events/${slug}`);
    } else if (selectedKey === 'share' && supportWebShare) {
      const shareTitle = `Webinar — ${title} — inLive Room`;
      await webShare(`${APP_ORIGIN}/events/${slug}`, shareTitle);
    }
  };

  return (
    <Dropdown className="min-w-36 ring-1 ring-zinc-800" closeOnSelect={false}>
      <DropdownTrigger>
        <Button className="min-w-0 rounded-md bg-zinc-800 px-4 py-2 text-base font-medium text-white antialiased hover:bg-zinc-700 active:bg-zinc-600">
          Share
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        disallowEmptySelection
        onAction={onShareOptionSelected}
        aria-label="Share options"
      >
        {[
          <DropdownItem key="copy" textValue="Copy link">
            <div className="flex items-center gap-2 text-sm">
              <span>
                {copiedActive ? (
                  <CheckIcon width={20} height={20} />
                ) : (
                  <LinkIcon width={20} height={20} />
                )}
              </span>
              <span>{copiedActive ? 'Copied!' : 'Copy link'}</span>
            </div>
          </DropdownItem>,
          // @ts-ignore
          supportWebShare ? (
            <DropdownItem key="share" textValue="Share via">
              <div className="flex items-center gap-2 text-sm">
                <span>
                  <ShareIcon width={20} height={20} />
                </span>
                <span>Share via</span>
              </div>
            </DropdownItem>
          ) : undefined,
        ]}
      </DropdownMenu>
    </Dropdown>
  );
}

function CheckIcon(props: SVGElementPropsType) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" {...props}>
      <path
        fill="currentColor"
        d="M104 196a12.2 12.2 0 0 1-8.5-3.5l-56-56a12 12 0 0 1 17-17L104 167L207.5 63.5a12 12 0 0 1 17 17l-112 112a12.2 12.2 0 0 1-8.5 3.5Z"
      />
    </svg>
  );
}

function LinkIcon(props: SVGElementPropsType) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" {...props}>
      <path
        fill="currentColor"
        d="m85.6 153.4l67.9-67.8a12 12 0 0 1 16.9 16.9l-67.9 67.9a12 12 0 0 1-16.9 0a12 12 0 0 1 0-17Zm50.9 17l-28.3 28.3a36 36 0 0 1-50.9-50.9l28.3-28.3a12 12 0 0 0 0-17a12.2 12.2 0 0 0-17 0l-28.3 28.3a60 60 0 0 0 84.9 84.9l28.2-28.3a12 12 0 0 0 0-17a11.9 11.9 0 0 0-16.9 0Zm79.2-130.1a60.1 60.1 0 0 0-84.9 0l-28.3 28.3a12.2 12.2 0 0 0 0 17a12 12 0 0 0 17 0l28.3-28.3a36 36 0 1 1 50.9 50.9l-28.3 28.3a12.1 12.1 0 0 0 8.5 20.5a11.7 11.7 0 0 0 8.5-3.6l28.3-28.2a60 60 0 0 0 0-84.9Z"
      />
    </svg>
  );
}

function ShareIcon(props: SVGElementPropsType) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="m13.576 17.271l-5.11-2.787a3.5 3.5 0 1 1 0-4.968l5.11-2.787a3.5 3.5 0 1 1 .958 1.755l-5.11 2.787a3.514 3.514 0 0 1 0 1.457l5.11 2.788a3.5 3.5 0 1 1-.958 1.755"
      />
    </svg>
  );
}
