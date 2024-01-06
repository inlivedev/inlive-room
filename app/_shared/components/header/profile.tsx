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
import Sentry from '@sentry/nextjs';
import { useAuthContext } from '@/_shared/contexts/auth';
import ArrowDownFillIcon from '@/_shared/components/icons/arrow-down-fill-icon';
import { InternalApiFetcher } from '@/_shared/utils/fetcher';
import type { AuthType } from '@/_shared/types/auth';

export default function Profile() {
  const { user, setAuthState } = useAuthContext();

  const openSignInModal = () => {
    document.dispatchEvent(new CustomEvent('open:sign-in-modal'));
  };

  const onProfileSelection = useCallback(
    async (selectedKey: Key) => {
      if (selectedKey === 'signout') {
        const signOutResponse: AuthType.SignOutResponse =
          await InternalApiFetcher.get('/api/auth/signout');

        if (!signOutResponse || !signOutResponse.ok) {
          Sentry.captureMessage(
            `API call error when trying to sign out. ${
              signOutResponse?.message || ''
            }`,
            'error'
          );
        }

        setAuthState &&
          setAuthState((prevState) => ({
            ...prevState,
            user: null,
          }));
      }
    },
    [setAuthState]
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
                  src={user.picture_url}
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
            disabledKeys={['profile']}
          >
            <DropdownSection
              aria-label="Profile information"
              showDivider
              className="mb-0"
            >
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
                        src={user.picture_url}
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
