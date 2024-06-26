'use client';

import { useEffect, useCallback, useState } from 'react';
import {
  Button,
  Modal,
  ModalContent,
  ModalBody,
  Spinner,
  useDisclosure,
} from '@nextui-org/react';
import * as Sentry from '@sentry/nextjs';
import type { EventType } from '@/_shared/types/event';
import { InternalApiFetcher } from '@/_shared/utils/fetcher';
import { useInput } from '@/_shared/hooks/use-input';
import { useNavigate } from '@/_shared/hooks/use-navigate';
import { useFormattedDateTime } from '@/_shared/hooks/use-formatted-datetime';

export default function EventRegistrationModal({
  event: eventData,
}: {
  event: EventType.Event;
}) {
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { navigateTo } = useNavigate();

  const {
    value: firstNameInput,
    bindValue: bindFirstNameInput,
    setValue: setFirstNameInput,
  } = useInput('');

  const {
    value: lastNameInput,
    bindValue: bindLastNameInput,
    setValue: setLastNameInput,
  } = useInput('');

  const {
    value: emailInput,
    bindValue: bindEmailInput,
    setValue: setEmailInput,
  } = useInput('');

  const openModal = useCallback(() => {
    onOpen();
  }, [onOpen]);

  const onCloseModal = useCallback(() => {
    setFirstNameInput('');
    setLastNameInput('');
    setEmailInput('');
  }, [setFirstNameInput, setLastNameInput, setEmailInput]);

  useEffect(() => {
    document.addEventListener('open:event-registration-modal', openModal);

    return () => {
      document.removeEventListener('open:event-registration-modal', openModal);
    };
  }, [openModal]);

  const onSubmitEventRegistration = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!isSubmitting) {
      setIsSubmitting(true);

      try {
        if (firstNameInput.trim().length === 0) {
          throw new Error('Please fill out the first name field');
        }

        if (emailInput.trim().length === 0) {
          throw new Error('Please fill out the email field');
        }

        const body = {
          firstName: firstNameInput,
          lastName: lastNameInput,
          email: emailInput,
        };

        try {
          const response: EventType.RegisterParticipantResponse =
            await InternalApiFetcher.post(
              `/api/events/${eventData.slug}/register`,
              {
                body: JSON.stringify(body),
              }
            );

          if (!response || !response.ok) {
            throw new Error(
              response?.message ||
                'An error has occured on our side please try again later'
            );
          }

          const participantName =
            `${response.data.participant.firstName} ${response.data.participant.lastName}`.trim();

          const redirectPath = new URL(
            `/events/${eventData.slug}/registration-success`,
            window.location.origin
          );

          redirectPath.searchParams.append('name', participantName);
          if (response.data.event.roomId) {
            redirectPath.searchParams.append(
              'roomID',
              response.data.event.roomId
            );

            redirectPath.searchParams.append(
              'clientID',
              response.data.participant.clientId
            );
          }

          onClose();
          setFirstNameInput('');
          setLastNameInput('');
          setEmailInput('');
          setIsSubmitting(false);
          navigateTo(redirectPath.href);
        } catch (error) {
          Sentry.captureException(error, {
            extra: {
              message:
                'API call error when user tries to register to the event',
            },
          });

          throw error;
        }
      } catch (error) {
        setIsSubmitting(false);
        console.error(error);

        if (error instanceof Error) {
          alert(error.message);
        }
      }
    }
  };

  const eventDate = useFormattedDateTime(eventData.startTime, 'en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  const eventTime = useFormattedDateTime(eventData.startTime, 'en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} onClose={onCloseModal}>
      <ModalContent className="w-screen max-w-none ring-1 ring-zinc-800 sm:max-w-[400px]">
        <ModalBody className="px-4 pb-4 pt-6 sm:px-10 sm:pb-10 sm:pt-12">
          <div>
            <h2 className="text-xl font-bold text-zinc-100 ">
              Event registration
            </h2>
            <p className="mt-3 text-sm font-semibold text-zinc-200">
              {eventData.name}
            </p>
            <p className="mt-1 text-sm text-zinc-200">
              <span>{eventDate}</span>&nbsp;at&nbsp;
              <span className="lowercase">{eventTime}</span>
            </p>
            <form className="mt-10" onSubmit={onSubmitEventRegistration}>
              <div>
                <div className="mb-3">
                  <label
                    htmlFor="first-name-input"
                    className="mb-1 block text-sm font-medium text-zinc-200"
                  >
                    First name
                  </label>
                  <input
                    id="first-name-input"
                    type="text"
                    required
                    placeholder="Enter your first name"
                    className="w-full rounded-md bg-zinc-950 px-3 py-2.5 text-sm text-zinc-200 shadow-sm outline-none ring-1 ring-zinc-700 focus-visible:ring-1 focus-visible:ring-zinc-400"
                    autoComplete="off"
                    {...bindFirstNameInput}
                  />
                </div>
                <div className="mb-3">
                  <label
                    htmlFor="last-name-input"
                    className="mb-1 block text-sm font-medium text-zinc-200"
                  >
                    Last name
                  </label>
                  <input
                    id="last-name-input"
                    type="text"
                    placeholder="Enter your last name"
                    className="w-full rounded-md bg-zinc-950 px-3 py-2.5 text-sm text-zinc-200 shadow-sm outline-none ring-1 ring-zinc-700 focus-visible:ring-1 focus-visible:ring-zinc-400"
                    autoComplete="off"
                    {...bindLastNameInput}
                  />
                </div>
                <div>
                  <label
                    htmlFor="email-input"
                    className="mb-1 block text-sm font-medium text-zinc-200"
                  >
                    Email address
                  </label>
                  <input
                    id="email-input"
                    type="email"
                    required
                    placeholder="Enter your email"
                    className="w-full rounded-md bg-zinc-950 px-3 py-2.5 text-sm text-zinc-200 shadow-sm outline-none ring-1 ring-zinc-700 focus-visible:ring-1 focus-visible:ring-zinc-400"
                    autoComplete="off"
                    {...bindEmailInput}
                  />
                </div>
              </div>
              <div className="mt-6">
                <Button
                  variant="flat"
                  className="w-full rounded-md bg-red-700 px-6 py-2 text-base font-medium text-zinc-100 antialiased hover:bg-red-600 active:bg-red-500"
                  type="submit"
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
                      <span>Submitting...</span>
                    </div>
                  ) : (
                    <span>Submit registration</span>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
