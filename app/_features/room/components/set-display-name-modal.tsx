'use client';

import { useEffect, useCallback } from 'react';
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure,
} from '@nextui-org/react';
import { InternalApiFetcher } from '@/_shared/utils/fetcher';
import { useInput } from '@/_shared/hooks/use-input';
import type { ClientType } from '@/_shared/types/client';
import { useClientContext } from '@/_features/room/contexts/client-context';

type Props = {
  roomID: string;
};

export default function SetDisplayNameModal({ roomID }: Props) {
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const { clientID } = useClientContext();

  const {
    value: clientNameInput,
    bindValue: bindClientNameInput,
    setValue: setClientNameInput,
  } = useInput('');

  const openModal = useCallback(() => {
    onOpen();
  }, [onOpen]);

  const onSubmitDisplayName = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      try {
        if (clientNameInput.trim().length === 0) {
          throw new Error('Please enter a valid display name');
        }

        const response: ClientType.SetClientNameResponse =
          await InternalApiFetcher.put(
            `/api/room/${roomID}/setname/${clientID}`,
            {
              body: JSON.stringify({
                name: clientNameInput,
                pathname: window.location.pathname,
              }),
            }
          );

        if (response.ok) {
          const clientName = response.data.name;
          document.dispatchEvent(
            new CustomEvent('set:client-name', {
              detail: {
                clientName: clientName,
              },
            })
          );
          onClose();
        } else {
          throw new Error(
            'An error has occured on our side please try again later'
          );
        }
      } catch (error) {
        console.error(error);

        if (error instanceof Error) {
          alert(error.message);
        }
      }
    },
    [roomID, clientID, clientNameInput, onClose]
  );

  const onCloseModal = useCallback(() => {
    setClientNameInput('');
  }, [setClientNameInput]);

  useEffect(() => {
    document.addEventListener('open:set-display-name-modal', openModal);

    return () => {
      document.removeEventListener('open:set-display-name-modal', openModal);
    };
  }, [openModal]);

  return (
    <Modal
      size="md"
      placement="center"
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
        <ModalHeader className="p-4 sm:px-6">
          <div>
            <h3>Change display name</h3>
            <p className="mt-1 text-sm font-normal text-zinc-400">
              Use a display name which easily recognized by others
            </p>
          </div>
        </ModalHeader>
        <ModalBody className="p-0">
          <form onSubmit={onSubmitDisplayName}>
            <div className="p-4 sm:px-6">
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
            <div className="flex justify-end gap-3 p-4 sm:px-6">
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
            </div>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
