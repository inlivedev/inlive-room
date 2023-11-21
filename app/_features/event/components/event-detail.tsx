'use client';

import { Button } from '@nextui-org/react';
import Header from '@/_shared/components/header/header';
import CalendarIcon from '@/_shared/components/icons/calendar-icon';
import EventRegistrationModal from '@/_features/event/components/event-registration-modal';
import { copyToClipboard } from '@/_shared/utils/copy-to-clipboard';

const APP_ORIGIN = process.env.NEXT_PUBLIC_APP_ORIGIN;

export default function EventDetail({ eventID }: { eventID: string }) {
  const openRegisterEventForm = () => {
    document.dispatchEvent(new CustomEvent('open:event-registration-modal'));
  };

  const handleCopyLink = async (text = '') => {
    const success = await copyToClipboard(text);
    if (success) {
      alert('Link has been successfully copied!');
    } else {
      alert('Fail to copy link');
    }
  };

  return (
    <>
      <EventRegistrationModal />
      <div className="min-viewport-height bg-zinc-900 text-zinc-200">
        <div className="min-viewport-height mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-4">
          <Header logoText="inLive Event" logoHref="/event" />
          <main className="flex flex-1 flex-col">
            <h2 className="text-2xl font-bold text-zinc-100 lg:text-4xl">
              In-House vs Agency vs Freelance
            </h2>
            <div className="mt-6 flex gap-2">
              <span>
                <CalendarIcon width={24} height={24} />
              </span>
              <p className="text-base text-zinc-100">
                Dec 21, 7:30pm (GMT +07:00)
              </p>
            </div>
            <div className="mt-6 flex flex-col gap-10 lg:flex-row">
              <div className="flex-auto lg:max-w-xl xl:max-w-[640px]">
                <h3 className="text-lg font-medium text-zinc-100">
                  About this event
                </h3>
                <div className="prose prose-sm mt-3 max-w-none text-zinc-200 lg:prose-base">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco
                  laboris nisi ut aliquip ex ea commodo consequat. Duis aute
                  irure dolor in reprehenderit in voluptate velit esse cillum
                  dolore eu fugiat nulla pariatur. Excepteur sint occaecat
                  cupidatat non proident, sunt in culpa qui officia deserunt
                  mollit anim id est laborum.
                </div>
              </div>
              <div className="flex-1">
                <div className="flex w-full flex-col gap-4 rounded-3xl lg:bg-black/25 lg:p-6">
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
                            Register to Join
                          </Button>
                        </div>
                        <div>
                          <Button
                            variant="flat"
                            className="rounded-md bg-zinc-800 px-4 py-2 text-base font-medium text-zinc-100 antialiased hover:bg-zinc-700 active:bg-zinc-600"
                            onClick={() =>
                              handleCopyLink(`${APP_ORIGIN}/room/${eventID}`)
                            }
                          >
                            Copy link
                          </Button>
                        </div>
                      </div>
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
