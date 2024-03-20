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
import ArrowDownFillIcon from '@/_shared/components/icons/arrow-down-fill-icon';
import { InternalApiFetcher } from '@/_shared/utils/fetcher';
import type { AuthType } from '@/_shared/types/auth';

export default function Profile({
  user,
}: {
  user: AuthType.CurrentAuthContext;
}) {
  const onProfileSelection = useCallback(async (selectedKey: Key) => {
    switch (selectedKey) {
      case 'signout':
        {
          try {
            await InternalApiFetcher.get('/api/auth/signout');
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
  }, []);

  return (
    <Dropdown placement="bottom-end" className=" ring-1 ring-zinc-800">
      <DropdownTrigger>
        <Button
          variant="flat"
          size="sm"
          className="inline-flex h-9 min-h-0 min-w-0 items-center bg-transparent pl-1 pr-0"
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
        <DropdownItem key="signout" textValue="signout">
          Sign Out
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
