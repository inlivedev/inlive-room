import { useEffect } from 'react';
import { useToggle } from '@/_shared/hooks/use-toggle';
import Link from 'next/link';
import { Button } from '@nextui-org/react';
import LobbyInvite from '@/_features/room/components/lobby-entrance-invite';

export default function LobbyEntrance({
  pageId,
  origin,
}: {
  pageId: string;
  origin: string;
}) {
  const { active: isComponentActive, setActive: setActiveComponent } =
    useToggle(false);

  const openConferenceRoom = () => {
    document.dispatchEvent(new CustomEvent('open:conference-component'));
  };

  useEffect(() => {
    document.addEventListener(
      'open:lobby-entrance-component',
      setActiveComponent
    );

    return () => {
      document.removeEventListener(
        'open:lobby-entrance-component',
        setActiveComponent
      );
    };
  }, [setActiveComponent]);

  return isComponentActive ? (
    <div className="flex flex-col gap-10">
      <div>
        <h2 className="text-xs font-medium uppercase tracking-tight text-zinc-400">
          Room ID
        </h2>
        <b className="block text-2xl font-bold">{pageId}</b>
      </div>
      <div>
        <h3 className="font-medium">You are about to enter this room</h3>
        <p className="mt-0.5 text-sm text-zinc-400">
          Anyone with the link or room ID can enter this room. Make sure your
          device camera and microphone are working properly.
        </p>
      </div>
      <div>
        <label
          htmlFor="display-name-readonly"
          className="mb-3 inline-block text-sm font-medium"
        >
          Your display name
        </label>
        <input
          id="display-name-readonly"
          className="w-full rounded-md bg-zinc-950 px-4 py-2.5 text-sm text-zinc-200 outline-none ring-1 ring-zinc-700 focus-visible:ring-1 focus-visible:ring-zinc-400"
          type="text"
          placeholder="Your real name or nickname"
          readOnly
          defaultValue="Faiq Naufal"
        />
        <p className="mt-3 text-xs text-zinc-400">
          Other participants can easily recognize you by your display name
        </p>
      </div>
      <div>
        <LobbyInvite pageId={pageId} origin={origin} />
      </div>
      <div className="flex flex-row flex-wrap justify-center gap-x-8 gap-y-6">
        <div className="flex-1">
          <Button
            as={Link}
            href="/"
            variant="flat"
            className="w-full min-w-[240px] rounded-md  bg-zinc-800 px-4  py-2 text-sm text-zinc-200 hover:bg-zinc-700 active:bg-zinc-600"
          >
            Back to front page
          </Button>
        </div>
        <div className="flex-1">
          <Button
            variant="flat"
            className="w-full min-w-[240px] rounded-md bg-red-700 px-4 py-2 text-sm text-zinc-200 hover:bg-red-600 active:bg-red-500 lg:w-auto"
            onClick={openConferenceRoom}
          >
            Enter this room
          </Button>
        </div>
      </div>
    </div>
  ) : null;
}
