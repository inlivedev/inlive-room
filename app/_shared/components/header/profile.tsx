'use client';

import { type Key, useCallback } from 'react';
import Image from 'next/image';
import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
} from '@nextui-org/react';
import * as Sentry from '@sentry/nextjs';
import { useAuthContext } from '@/_shared/contexts/auth';
import ArrowDownFillIcon from '@/_shared/components/icons/arrow-down-fill-icon';
import { InternalApiFetcher } from '@/_shared/utils/fetcher';
import { useNavigate } from '@/_shared/hooks/use-navigate';

export default function Profile() {
  const { user, setUser } = useAuthContext();
  const { navigateTo } = useNavigate();

  const openSignInModal = () => {
    document.dispatchEvent(new CustomEvent('open:sign-in-modal'));
  };

  const onProfileSelection = useCallback(
    async (selectedKey: Key) => {
      switch (selectedKey) {
        case 'my-events':
          navigateTo(`/events`);
          break;
        case 'signout':
          {
            try {
              await InternalApiFetcher.get('/api/auth/signout');
              setUser(null);
              window.location.reload();
            } catch (error) {
              console.error(error);
              Sentry.captureException(error, {
                extra: {
                  message: `Error when trying to sign out.`,
                },
              });
            }
          }
          break;
        default:
          break;
      }
    },
    [navigateTo, setUser]
  );

  return (
    <>
      {user ? (
        <Dropdown placement="bottom-end" className=" ring-1 ring-zinc-800">
          <DropdownTrigger>
            <Button
              variant="flat"
              size="sm"
              className="inline-flex min-h-unit-9 min-w-0 items-center bg-transparent"
              disableRipple
            >
              <div className="h-7 w-7 rounded-full ring-2 ring-zinc-700 ring-offset-2 ring-offset-zinc-800 lg:mr-1 lg:h-6 lg:w-6">
                <Image
                  referrerPolicy="no-referrer"
                  src={user.pictureUrl}
                  alt={`Image of ${user.name}`}
                  loading="lazy"
                  width={28}
                  height={28}
                  className="h-full w-full rounded-full"
                  unoptimized
                />
              </div>
              <span className="hidden text-sm lg:inline-flex">{user.name}</span>
              <ArrowDownFillIcon className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            disallowEmptySelection
            aria-label="Profile menu"
            onAction={onProfileSelection}
          >
            <DropdownSection aria-label="Profile information" showDivider>
              <DropdownItem
                key="profile"
                textValue="profile"
                className="opacity-100"
                classNames={{
                  title: '!overflow-visible',
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center">
                    <div className="h-7 w-7 rounded-full ring-2 ring-zinc-700 ring-offset-2 ring-offset-zinc-800">
                      <Image
                        referrerPolicy="no-referrer"
                        src={user.pictureUrl}
                        alt={`Image of ${user.name}`}
                        loading="lazy"
                        width={28}
                        height={28}
                        className="h-full w-full rounded-full"
                        unoptimized
                      />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <p>{user.name}</p>
                    <p className="text-xs text-foreground-400">{user.email}</p>
                  </div>
                </div>
              </DropdownItem>
            </DropdownSection>
            <DropdownItem key="my-events" textValue="my-events">
              <div className="flex justify-between text-sm font-medium text-zinc-200">
                <span className="inline-block">My Events</span>
                <div className="inline-flex items-center">
                  <span className="rounded-sm border-1 border-emerald-800 bg-emerald-950 px-1.5 text-[11px] font-medium leading-4 tracking-[0.275px] text-emerald-300">
                    Beta
                  </span>
                </div>
              </div>
            </DropdownItem>
            <DropdownItem key="signout" textValue="signout">
              Sign Out
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      ) : (
        <Button
          variant="flat"
          size="sm"
          className="bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 sm:h-unit-9 sm:w-unit-20 sm:px-4 sm:text-sm"
          onClick={openSignInModal}
        >
          Sign In
        </Button>
      )}
    </>
  );
}
