'use client';

import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
} from '@nextui-org/react';
import { InternalApiFetcher } from '@/_shared/utils/fetcher';
import type { AuthType } from '@/_shared/types/auth';
import GoogleIcon from '@/_shared/components/icons/google-icon';
import GithubIcon from '@/_shared/components/icons/github-icon';

type SignInModalProps = {
  isOpen: boolean;
  onOpenChange(): void;
};

const providers = [
  {
    name: 'google',
    text: 'Continue with Google',
    icon: <GoogleIcon width={20} height={20} />,
  },
  {
    name: 'github',
    text: 'Continue with GitHub',
    icon: <GithubIcon width={20} height={20} />,
  },
];

export default function SignInModal({
  isOpen,
  onOpenChange,
}: SignInModalProps) {
  const handleSignIn = async (provider: string) => {
    try {
      const response: AuthType.AuthorizeResponse =
        await InternalApiFetcher.post(`/api/auth/${provider}/authorize`);

      window.location.href = response.data;
    } catch (error) {
      console.error(error);
      alert(
        `There is a problem with ${provider} sign in. Please try again later.`
      );
    }
  };

  return (
    <Modal
      size="sm"
      isOpen={isOpen}
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
