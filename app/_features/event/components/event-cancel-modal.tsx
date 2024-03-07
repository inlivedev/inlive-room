import { useNavigate } from '@/_shared/hooks/use-navigate';
import { InternalApiFetcher } from '@/_shared/utils/fetcher';
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner,
  useDisclosure,
} from '@nextui-org/react';
import { useState, useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import WarningIcon from '@/_shared/components/icons/warning-icon';

export default function CancelEventModal({ slug }: { slug: string }) {
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const [isDeleting, setIsDeleting] = useState(false);
  const { navigateTo } = useNavigate();

  useEffect(() => {
    const openModal = () => {
      onOpen();
    };

    document.addEventListener('open:event-cancel-modal', openModal);

    return () => {
      document.removeEventListener('open:event-cancel-modal', openModal);
    };
  }, [onOpen]);

  return (
    <Modal
      size="md"
      placement="center"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        <ModalHeader>
          <h3>cancel this event</h3>
        </ModalHeader>

        <ModalBody>
          <div>
            <div className="flex gap-2">
              <div className="flex items-center rounded bg-red-950 p-2  text-red-200 ring-1 ring-red-900">
                <WarningIcon height={20} width={20}></WarningIcon>
              </div>
              <p className="flex w-full items-center gap-2 rounded bg-red-950 p-2 text-sm text-red-200 ring-1 ring-red-900">
                This action cannot be undone!
              </p>
            </div>
            <p className="mt-4">
              Are you sure you want to cancel this event? <br />
              Cancelling the event will make the room unavailable
            </p>
          </div>
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
                const response = await InternalApiFetcher.put(
                  `/api/events/${slug}/cancel`
                );

                if (response.ok) {
                  navigateTo('/events');
                } else {
                  alert('Failed to cancel event, please try again later');
                }
              } catch (error) {
                Sentry.captureException(error);
              } finally {
                setIsDeleting(false);
              }
            }}
            className="w-full basis-1/2 rounded-md bg-red-800 px-6 py-2 text-base font-medium text-zinc-100 antialiased hover:bg-red-700 active:bg-red-600"
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
                <span>Cancelling...</span>
              </div>
            ) : (
              <span>Cancel this event</span>
            )}
          </Button>{' '}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
