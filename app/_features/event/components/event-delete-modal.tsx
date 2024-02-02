import { useNavigate } from '@/_shared/hooks/use-navigate';
import { InternalApiFetcher } from '@/_shared/utils/fetcher';
import {
  Button,
  Code,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner,
  useDisclosure,
} from '@nextui-org/react';
import { useState, useEffect, useCallback } from 'react';
import * as Sentry from '@sentry/nextjs';
import WarningIcon from '@/_shared/components/icons/warning-icon';

export function DeleteEventModal({ slug }: { slug: string }) {
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const [isDeleting, setIsDeleting] = useState(false);
  const { navigateTo } = useNavigate();

  const openModal = useCallback(() => {
    onOpen();
  }, [onOpen]);

  useEffect(() => {
    document.addEventListener('open:event-delete-modal', openModal);
  });

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      className="w-[calc(100%-1.5em)]"
    >
      <ModalContent>
        <ModalHeader>
          <h3>Delete Event</h3>
        </ModalHeader>

        <ModalBody>
          <div className="flex gap-2">
            <Code className="flex w-fit items-center gap-2 rounded-sm bg-red-950 text-xs text-red-300 ring-1 ring-red-800">
              <WarningIcon height={24} width={24}></WarningIcon>
            </Code>
            <Code className="h-100 flex w-full items-center gap-2 rounded-sm bg-red-950 text-xs text-red-300 ring-1 ring-red-800">
              <p className="w-full">This action cannot be undone!</p>
            </Code>
          </div>
          <p className="mt-1 font-normal">
            Are you sure you want to delete this event?
          </p>
        </ModalBody>
        <ModalFooter>
          <Button
            onPress={onClose}
            className="flex min-w-0 basis-1/2 items-center gap-1.5 rounded-md bg-zinc-800 text-base font-medium text-zinc-100 antialiased hover:bg-zinc-700 active:bg-zinc-600"
          >
            Cancel
          </Button>
          <Button
            onPress={async () => {
              setIsDeleting(true);
              try {
                const response = await InternalApiFetcher.delete(
                  `/api/events/${slug}`
                );

                if (response.ok) {
                  navigateTo(new URL('/event', window.location.origin).href);
                } else {
                  alert('Failed to delete event, please try again later');
                }
              } catch (error) {
                Sentry.captureException(error);
              } finally {
                setIsDeleting(false);
              }
            }}
            className="w-full basis-1/2 rounded-md bg-red-700 px-6 py-2 text-base font-medium text-zinc-100 antialiased hover:bg-red-600 active:bg-red-500"
          >
            {isDeleting ? (
              <div className="flex gap-2">
                <Spinner
                  classNames={{
                    circle1: 'border-b-zinc-200',
                    circle2: 'border-b-zinc-200',
                    wrapper: 'w-4 h-4',
                  }}
                />
                <span>Deleting...</span>
              </div>
            ) : (
              <span>Delete</span>
            )}
          </Button>{' '}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
