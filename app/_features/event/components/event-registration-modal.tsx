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
import { InternalApiFetcher } from '@/_shared/utils/fetcher';
import { useInput } from '@/_shared/hooks/use-input';

export default function EventRegistrationModal() {
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        onClose();
        setFirstNameInput('');
        setLastNameInput('');
        setEmailInput('');
        setIsSubmitting(false);
      } catch (error) {
        setIsSubmitting(false);
        console.error(error);

        if (error instanceof Error) {
          alert(error.message);
        }
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} onClose={onCloseModal}>
      <ModalContent className="w-screen max-w-none ring-1 ring-zinc-800 sm:max-w-[400px]">
        <ModalBody className="px-4 pb-4 pt-6 sm:px-10 sm:pb-10 sm:pt-12">
          <div>
            <h2 className="text-xl font-bold text-zinc-100 ">
              Event registration
            </h2>
            <p className="mt-3 text-sm font-semibold text-zinc-200">
              In-House vs Agency vs Freelance
            </p>
            <p className="mt-1 text-sm text-zinc-200">
              Dec 21, 7:30pm (GMT +07:00)
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
                    placeholder="Enter your first name"
                    className="w-full rounded-md bg-zinc-950 px-3 py-2.5 text-sm text-zinc-200 shadow-sm outline-none ring-1 ring-zinc-700 focus-visible:ring-1 focus-visible:ring-zinc-400"
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
                    type="text"
                    placeholder="Enter your email"
                    className="w-full rounded-md bg-zinc-950 px-3 py-2.5 text-sm text-zinc-200 shadow-sm outline-none ring-1 ring-zinc-700 focus-visible:ring-1 focus-visible:ring-zinc-400"
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
                  Submit registration
                </Button>
              </div>
            </form>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
