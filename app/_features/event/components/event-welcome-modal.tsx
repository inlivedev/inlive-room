'use client';
import Image from 'next/image';
import { Button, Modal, ModalBody, ModalContent } from '@nextui-org/react';

export default function EventWelcomeModal() {
  return (
    <>
      <Modal
        defaultOpen={true}
        isDismissable={false}
        hideCloseButton={true}
        size="2xl"
        backdrop="blur"
      >
        <ModalContent className="ring-1 ring-zinc-800">
          <ModalBody className="block p-0">
            <div className="flex justify-center p-6">
              <Image
                width={320}
                height={246}
                src="/images/webinar/event-welcome-banner.png"
                alt="inLive Event Poster Illustration"
                unoptimized
              ></Image>
            </div>
            <div className="p-6 text-sm text-zinc-300 md:px-6 md:py-2">
              <p>
                Hey there! <br />
                Welcome to your inLive Event dashboard.
              </p>
              <p className="mt-5 text-pretty">
                This is where you&apos;ll manage all your webinar events.
                We&apos;ve got some exciting features coming soon, like
                analytics and easy payment processing.
              </p>
              <p className="mt-5 text-pretty">
                Let&apos;s jump into a quick intro to get you started.
              </p>
            </div>
            <div className="p-6 text-right">
              <Button className="min-w-0 rounded-lg bg-red-700 px-4 py-2 text-base font-medium antialiased hover:bg-red-600 active:bg-red-500">
                Ok, next
              </Button>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
