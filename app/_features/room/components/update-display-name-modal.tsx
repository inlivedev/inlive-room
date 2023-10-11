'use client';

import { useEffect, useCallback } from 'react';
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from '@nextui-org/react';
import { InternalApiFetcher } from '@/_shared/utils/fetcher';
import { useInput } from '@/_shared/hooks/use-input';
import type { ClientType } from '@/_shared/types/client';

type Props = {
  client: ClientType.ClientData;
};

export default function UpdateClientModal({ client }: Props) {
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const {
    value: clientName,
    bindValue: bindClientNameInput,
    setValue: setClientName,
  } = useInput('');

  const openModal = useCallback(() => {
    onOpen();
  }, [onOpen]);

  const onSubmitDisplayName = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      try {
        if (clientName.trim().length === 0) {
          throw new Error('Please enter a valid display name');
        }

        alert(
          `Change display name with client ID ${client.clientID} is success`
        );
        onClose();
      } catch (error) {
        console.error(error);

        if (error instanceof Error) {
          alert(error.message);
        }
      }
    },
    [client, clientName, onClose]
  );

  const onCloseModal = useCallback(() => {
    setClientName('');
  }, [setClientName]);

  useEffect(() => {
    document.addEventListener('open:update-display-name-modal', openModal);

    return () => {
      document.removeEventListener('open:update-display-name-modal', openModal);
    };
  }, [openModal]);

  return (
    <Modal
      size="md"
      placement="center"
      backdrop="blur"
      isOpen={isOpen}
      onClose={onCloseModal}
      onOpenChange={onOpenChange}
      motionProps={{
        variants: {
          enter: {
            y: 0,
            opacity: 1,
            transition: {
              duration: 0.3,
              ease: 'easeOut',
            },
          },
          exit: {
            y: -20,
            opacity: 0,
            transition: {
              duration: 0.2,
              ease: 'easeIn',
            },
          },
        },
      }}
    >
      <ModalContent className="ring-1 ring-zinc-800">
        <form onSubmit={onSubmitDisplayName}>
          <ModalHeader>
            <div>
              <h3>Change display name</h3>
              <p className="mt-1 text-sm font-normal text-zinc-400">
                Use a display name which easily recognized by others
              </p>
            </div>
          </ModalHeader>
          <ModalBody className="px-6 py-4">
            <div>
              <label
                htmlFor="display-name-input"
                className="mb-3 block text-sm text-zinc-200"
              >
                New display name
              </label>
              <input
                id="display-name-input"
                className="w-full rounded-md bg-zinc-950 px-4 py-2.5 text-sm text-zinc-200 outline-none ring-1 ring-zinc-700 focus-visible:ring-1 focus-visible:ring-zinc-400"
                type="text"
                placeholder="Your real name or nickname"
                {...bindClientNameInput}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="flat"
              className="rounded-md bg-zinc-800 px-4 py-2 text-sm hover:bg-zinc-700 active:bg-zinc-600"
              onPress={onClose}
            >
              Cancel
            </Button>
            <Button
              variant="flat"
              className="rounded-md bg-zinc-200 px-4  py-2 text-sm text-zinc-900 hover:bg-zinc-100 active:bg-zinc-50"
              type="submit"
            >
              Change display name
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
