'use client';

import { useEffect, useCallback, useState } from 'react';
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure,
} from "@heroui/react";
import * as Sentry from '@sentry/nextjs';
import { InternalApiFetcher } from '@/_shared/utils/fetcher';
import type { AuthType } from '@/_shared/types/auth';
import GoogleIcon from '@/_shared/components/icons/google-icon';

const providers = [
  {
    name: 'google',
    text: 'Continue with Google',
    icon: <GoogleIcon width={20} height={20} />,
  },
];

interface SignInModalProps {
  isDismisable?: boolean;
  hideCloseButton?: boolean;
}

export default function SignInModal({
  isDismisable = true,
  hideCloseButton = false,
}: SignInModalProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openModal = useCallback(() => {
    onOpen();
  }, [onOpen]);

  useEffect(() => {
    document.addEventListener('open:sign-in-modal', openModal);

    return () => {
      document.removeEventListener('open:sign-in-modal', openModal);
    };
  }, [openModal]);

  const handleSignIn = async (provider: string) => {
    if (!isSubmitting) {
      setIsSubmitting(true);

      try {
        const response: AuthType.AuthorizeResponse =
          await InternalApiFetcher.post(`/api/auth/${provider}/authorize`, {
            body: JSON.stringify({
              pathname: window.location.pathname,
            }),
          });

        if (!response || !response.data) {
          throw new Error(
            `No redirect URL returned from authorization endpoint. ${
              response.message || ''
            }`
          );
        }

        window.location.href = response.data;
      } catch (error) {
        Sentry.captureException(error, {
          extra: {
            message: `API call error when trying to authorize with ${provider}.`,
          },
        });

        setIsSubmitting(false);
        console.error(error);
        alert(
          `There is a problem with ${provider} sign in. Please try again later.`
        );
      }
    }
  };

  return (
    <Modal
      isDismissable={isDismisable}
      hideCloseButton={hideCloseButton}
      size="sm"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
    >
      <ModalContent className="ring-1 ring-zinc-800">
        <ModalHeader className="flex justify-center">
          Sign in to your account
        </ModalHeader>
        <ModalBody className="px-6 pb-8 pt-4">
          <div className="flex flex-col gap-4">
            {providers.map((provider) => (
              <Button
                key={provider.name}
                startContent={provider.icon}
                variant="flat"
                className="bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600"
                onClick={() => handleSignIn(provider.name)}
                isDisabled={isSubmitting}
                aria-disabled={isSubmitting}
                disabled={isSubmitting}
              >
                {provider.text}
              </Button>
            ))}
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
