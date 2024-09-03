'use client';

import { useEffect, useState } from 'react';
import ButtonLeave from '@/_features/room/components/button-leave';
import ButtonMicrophone from '@/_features/room/components/button-microphone';
import ButtonCamera from '@/_features/room/components/button-camera';
import ButtonScreenShare from '@/_features/room/components/button-screen-share';
import ButtonChat from '@/_features/room/components/button-chat';
import { hasTouchScreen } from '@/_shared/utils/has-touch-screen';
import type { Sidebar, ParticipantVideo, DeviceType } from './conference';

export default function ConferenceActionsBar({
  streams,
  sidebar,
  deviceTypes,
}: {
  streams: ParticipantVideo[];
  sidebar: Sidebar;
  deviceTypes: DeviceType;
}) {
  const [isTouchScreen, setIsTouchScreen] = useState(true);

  useEffect(() => {
    setIsTouchScreen(hasTouchScreen());
  }, []);

  return (
    <div>
      <div className="absolute bottom-0 left-0 z-20 h-[72px] w-full bg-zinc-900">
        <div className="flex h-full w-full items-center justify-center gap-4 px-4 py-1.5 md:py-3 lg:gap-6">
          <div className="flex h-full flex-col justify-center">
            <ButtonMicrophone streams={streams} deviceTypes={deviceTypes} />
          </div>
          <div className="flex h-full flex-col justify-center">
            <ButtonCamera streams={streams} deviceTypes={deviceTypes} />
          </div>
          <div
            className={`h-full flex-col justify-center ${
              isTouchScreen ? 'hidden' : 'flex'
            }`}
          >
            <ButtonScreenShare />
          </div>
          <div className="flex h-full flex-col justify-center">
            <ButtonChat sidebar={sidebar} />
          </div>
          <div className="flex h-full flex-col justify-center">
            <ButtonLeave streams={streams} />
          </div>
        </div>
      </div>
    </div>
  );
}
