'use client';

import { useEffect, useState } from 'react';
import { useDisclosure } from '@nextui-org/react';
import ConferenceTopBar from '@/_features/room/components/conference-top-bar';
import ConferenceParticipants from '@/_features/room/components/conference-participants';
import ConferenceActionsBar from '@/_features/room/components/conference-actions-bar';
import ParticipantListMenu from './participant-list-menu';
import RightDrawerMenu from './right-drawer-menu';

export default function Conference({ roomType }: { roomType: string }) {
  return (
    <div className="viewport-height grid grid-cols-[1fr,auto]">
      <div className="relative grid h-full grid-rows-[auto,auto,1fr,72px] overflow-y-hidden">
        <ConferenceTopBar />
        <ConferenceParticipants roomType={roomType} />
        <div>
          <ConferenceActionsBar />
        </div>
      </div>
      <RightDrawerMenuContainer />
    </div>
  );
}

const RightDrawerMenuContainer = () => {
  type Menu = 'participants' | 'chat' | '';
  const [menu, setMenu] = useState<Menu>('');
  const { isOpen, onOpenChange, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const openRightDrawerMenu = ((event: CustomEventInit) => {
      const { menu } = event.detail || {};
      setMenu(menu);
      onOpen();
    }) as EventListener;

    const closeRightDrawerMenu = (() => {
      setMenu('');
      onClose();
    }) as EventListener;

    document.addEventListener('open:right-drawer-menu', openRightDrawerMenu);
    document.addEventListener('close:right-drawer-menu', closeRightDrawerMenu);

    return () => {
      document.removeEventListener(
        'open:right-drawer-menu',
        openRightDrawerMenu
      );
      document.removeEventListener(
        'close:right-drawer-menu',
        closeRightDrawerMenu
      );
    };
  }, [onOpen, onClose]);

  return (
    <RightDrawerMenu isOpen={isOpen} onOpenChange={onOpenChange}>
      {menu === 'participants' ? <ParticipantListMenu /> : null}
    </RightDrawerMenu>
  );
};
