'use client';

import { Modal, ModalContent } from '@nextui-org/react';

export default function RightDrawerMenu({
  isOpen,
  onOpenChange,
  children,
}: {
  isOpen: boolean;
  onOpenChange: () => void;
  children: React.ReactNode;
}) {
  return (
    <Modal
      scrollBehavior="inside"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      hideCloseButton={true}
      size="full"
      classNames={{
        wrapper: 'flex justify-end',
      }}
      motionProps={{
        variants: {
          enter: {
            x: 0,
            opacity: 1,
            transition: {
              duration: 0.3,
              ease: 'easeOut',
            },
          },
          exit: {
            x: 50,
            opacity: 0,
            transition: {
              duration: 0.2,
              ease: 'easeIn',
            },
          },
        },
      }}
      className="viewport-height max-h-screen w-full border border-zinc-950 bg-zinc-800/75 shadow-md backdrop-blur-md sm:max-w-sm"
    >
      <ModalContent>{children}</ModalContent>
    </Modal>
  );
}
