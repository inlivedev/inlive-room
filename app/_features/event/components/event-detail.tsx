'use client';

import { Button } from '@nextui-org/react';
import Header from '@/_shared/components/header/header';
import CalendarIcon from '@/_shared/components/icons/calendar-icon';
import EventRegistrationModal from '@/_features/event/components/event-registration-modal';
import { copyToClipboard } from '@/_shared/utils/copy-to-clipboard';
import { useToggle } from '@/_shared/hooks/use-toggle';
import CopyOutlineIcon from '@/_shared/components/icons/copy-outline-icon';
import CheckIcon from '@/_shared/components/icons/check-icon';

const APP_ORIGIN = process.env.NEXT_PUBLIC_APP_ORIGIN;

type EventDetailProps = {
  title: string;
  descriptionMarkup: {
    __html: string | TrustedHTML;
  };
  startTime: Date;
  slug: string;
  host: string;
};

export default function EventDetail({
  title,
  descriptionMarkup,
  slug,
  host,
  startTime,
}: EventDetailProps) {
  const {
    active: copiedActive,
    setActive: setCopiedActive,
    setInActive: setCopiedInActive,
  } = useToggle(false);

  const openRegisterEventForm = () => {
    document.dispatchEvent(new CustomEvent('open:event-registration-modal'));
  };

  const handleCopyLink = async (text = '') => {
    const success = await copyToClipboard(text);

    if (success) {
      setCopiedActive();
      setTimeout(() => {
        setCopiedInActive();
      }, 2000);
    } else {
      alert('Fail to copy link');
    }
  };

  const eventStartDate = new Date(startTime).toLocaleDateString('en-GB', {
    month: 'long',
    day: '2-digit',
    year: 'numeric',
  });

  const eventStartTime = new Date(startTime).toLocaleTimeString('en-GB', {
    minute: '2-digit',
    hour: '2-digit',
    hour12: true,
  });

  return (
    <>
      <EventRegistrationModal slug={slug} />
      <div className="min-viewport-height bg-zinc-900 text-zinc-200">
        <div className="min-viewport-height mx-auto flex w-full max-w-6xl flex-1 flex-col px-4">
          <Header logoText="inLive Event" logoHref="/event" needAuth={true} />
          <main className="mb-28 flex flex-1 flex-col">
            <h2 className="text-2xl font-bold text-zinc-100 lg:text-4xl">
              {title}
            </h2>
            <div className="mt-4">
              <b className="font-medium text-zinc-100">Hosted by {host}</b>
            </div>
            <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
              <div className="lg:max-w-xl lg:flex-auto xl:max-w-[640px]">
                <div
                  className="prose prose-sm mt-6 max-w-none text-zinc-200 lg:prose-base prose-img:rounded-2xl prose-img:lg:rounded-3xl"
                  dangerouslySetInnerHTML={descriptionMarkup}
                ></div>
              </div>
              <div className="lg:flex-1">
                <div className="flex w-full flex-col gap-4 rounded-3xl p-6 lg:bg-black/25">
                  <div className="fixed bottom-0 left-0 z-20 w-full border-t border-zinc-700 bg-zinc-900 px-4 py-3 lg:relative lg:border-t-0 lg:bg-transparent lg:p-0">
                    <div className="flex flex-col gap-1 lg:gap-2">
                      <div className="lg:order-2">
                        <p className="text-sm text-zinc-500">
                          Limit participants to join: 50 people
                        </p>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex-auto">
                          <Button
                            variant="flat"
                            className="w-full rounded-md bg-red-700 px-6 py-2 text-base font-medium text-zinc-100 antialiased hover:bg-red-600 active:bg-red-500"
                            onClick={openRegisterEventForm}
                          >
                            Register to Attend
                          </Button>
                        </div>
                        <div>
                          <Button
                            variant="flat"
                            className="flex min-w-0 items-center gap-1.5 rounded-md bg-zinc-800 text-base font-medium text-zinc-100 antialiased hover:bg-zinc-700 active:bg-zinc-600"
                            onClick={() =>
                              handleCopyLink(`${APP_ORIGIN}/event/${slug}`)
                            }
                          >
                            <span>
                              {copiedActive ? (
                                <CheckIcon className="h-5 w-5" />
                              ) : (
                                <CopyOutlineIcon className="h-5 w-5" />
                              )}
                            </span>
                            <span className="hidden lg:inline">
                              {copiedActive ? 'Copied!' : 'Copy link'}
                            </span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <span>
                        <CalendarIcon width={24} height={24} />
                      </span>
                      <p className="text-base text-zinc-100">
                        {eventStartDate} at {eventStartTime}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
