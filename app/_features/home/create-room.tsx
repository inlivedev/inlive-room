'use client';

import { useCallback, useEffect, type Key } from 'react';
import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Spinner,
  Modal,
  ModalBody,
  useDisclosure,
  ModalContent,
  ModalHeader,
} from '@nextui-org/react';
import * as Sentry from '@sentry/nextjs';
import { useAuthContext } from '@/_shared/contexts/auth';
import { useState } from 'react';
import { Mixpanel } from '@/_shared/components/analytics/mixpanel';
import type { RoomType } from '@/_shared/types/room';
import { InternalApiFetcher } from '@/_shared/utils/fetcher';
import MeetingScheduleForm from '../meeting/schedule-form';

export default function CreateRoom() {
  const { user } = useAuthContext();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openSignInModal = () => {
    document.dispatchEvent(new CustomEvent('open:sign-in-modal'));
  };

  const createRoom = useCallback(async (type: string) => {
    const response: RoomType.CreateGetRoomResponse =
      await InternalApiFetcher.post('/api/rooms/create', {
        body: JSON.stringify({
          type: type,
        }),
      });

    if (!response || !response.ok) {
      throw new Error(
        `Failed to create a ${type} room. ${response?.message || ''}`
      );
    }

    const room = response.data;

    Mixpanel.track('Create room', {
      roomId: room.id,
      createdBy: room.createdBy,
    });

    return room;
  }, []);

  const onCreateRoomSelection = useCallback(
    async (key: Key) => {
      if (!user || isSubmitting || typeof key !== 'string') return;

      if (key === 'event' || key === 'meeting') {
        try {
          setIsSubmitting(true);
          const room = await createRoom(key);
          setIsSubmitting(false);
          window.location.href = `/rooms/${room.id}`;
        } catch (error) {
          Sentry.captureException(error, {
            extra: {
              message: `API call error when trying to create ${key} room`,
            },
          });

          setIsSubmitting(false);
          alert('Failed to create a room. Please try again later! ');
          console.error(error);
        }
      }

      if (key === 'schedule') {
        document.dispatchEvent(new CustomEvent('open:schedule-meeting-modal'));
      }
    },
    [user, isSubmitting, createRoom]
  );

  return (
    <section className="md:max-w-xl">
      <ScheduleModal />
      <h2 className="text-3xl font-semibold tracking-wide text-zinc-200 lg:text-4xl">
        Virtual room for your real-time collaboration
      </h2>
      <p className="mt-4 text-pretty text-base text-zinc-400 lg:text-lg">
        Connect with anyone, anywhere. Host or join in seconds. It&apos;s that
        simple! Experience real-time messaging, video, and audio for seamless
        collaboration, all within open-source virtual rooms.
      </p>
      <div className="mt-8">
        {user ? (
          <Dropdown
            placement="bottom-start"
            className="ring-1 ring-zinc-800/70"
          >
            <DropdownTrigger>
              <Button
                className="w-52 rounded-md bg-red-700 px-6 py-2 text-sm font-medium text-zinc-200 antialiased hover:bg-red-600 active:bg-red-500"
                isDisabled={isSubmitting}
                aria-disabled={isSubmitting}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex gap-2">
                    <Spinner
                      classNames={{
                        circle1: 'border-b-zinc-200',
                        circle2: 'border-b-zinc-200',
                        wrapper: 'w-4 h-4',
                      }}
                    />
                    <span>Creating a new room...</span>
                  </div>
                ) : (
                  <span>Create a new room</span>
                )}
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              disallowEmptySelection
              aria-label="Create a room menu"
              onAction={onCreateRoomSelection}
            >
              <DropdownItem
                key="meeting"
                classNames={{
                  wrapper: 'group',
                }}
              >
                <div className="text-sm font-medium text-zinc-200">
                  <span className="inline-block">Meeting</span>
                </div>
                <div className="text-xs text-zinc-400 group-hover:text-zinc-200">
                  Personal or group meetings
                </div>
              </DropdownItem>
              <DropdownItem
                key="event"
                classNames={{
                  wrapper: 'group',
                }}
              >
                <div className="flex justify-between text-sm font-medium text-zinc-200">
                  <span className="inline-block">Webinar</span>
                  <div className="inline-flex items-center">
                    <span className="rounded-sm border-1 border-emerald-800 bg-emerald-950 px-1.5 text-[11px] font-medium leading-4 tracking-[0.275px] text-emerald-300">
                      Beta
                    </span>
                  </div>
                </div>
                <div className="text-xs text-zinc-400 group-hover:text-zinc-200">
                  Host sessions with large audiences
                </div>
              </DropdownItem>
              <DropdownItem
                key="schedule"
                classNames={{
                  wrapper: 'group',
                }}
              >
                <div className="flex justify-between text-sm font-medium text-zinc-200">
                  <span className="inline-block">Schedule</span>
                  <div className="inline-flex items-center">
                    <span className="rounded-sm border-1 border-emerald-800 bg-emerald-950 px-1.5 text-[11px] font-medium leading-4 tracking-[0.275px] text-emerald-300">
                      Beta
                    </span>
                  </div>
                </div>
                <div className="text-xs text-zinc-400 group-hover:text-zinc-200">
                  Schedule a meeting for later
                </div>
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        ) : (
          <Button
            className="w-52 rounded-md bg-red-700 px-6 py-2 text-sm font-medium text-zinc-200 antialiased hover:bg-red-600 active:bg-red-500"
            onClick={openSignInModal}
          >
            Sign in to try inLive Room
          </Button>
        )}
      </div>
    </section>
  );
}

function ScheduleModal() {
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();

  useEffect(() => {
    const openModal = () => {
      onOpen();
    };

    document.addEventListener('open:schedule-meeting-modal', openModal);
    document.addEventListener('close:schedule-meeting-modal', onClose);

    return () => {
      document.removeEventListener('open:schedule-meeting-modal', openModal);
      document.removeEventListener('close:schedule-meeting-modal', onClose);
    };
  }, [onClose, onOpen]);

  return (
    <Modal
      size="md"
      placement="top"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isKeyboardDismissDisabled
      isDismissable={false}
      hideCloseButton
      scrollBehavior="inside"
    >
      <ModalBody>
        <ModalContent className="p-2">
          <ModalHeader className="flex flex-col">
            <h2>Schedule a Meeting</h2>
            <p className="text-sm font-normal text-zinc-400">
              Send a personal email to schedule a meeting
            </p>
          </ModalHeader>
          <ModalBody>
            <MeetingScheduleForm></MeetingScheduleForm>
          </ModalBody>
        </ModalContent>
      </ModalBody>
    </Modal>
  );
}
