import { Button } from '@nextui-org/react';
import { copyToClipboard } from '@/_shared/utils/copy-to-clipboard';
import { useToggle } from '@/_shared/hooks/use-toggle';
import CopyOutlineIcon from '@/_shared/components/icons/copy-outline-icon';
import CheckIcon from '@/_shared/components/icons/check-icon';

const APP_ORIGIN = process.env.NEXT_PUBLIC_APP_ORIGIN;

export default function InviteBox({ roomID }: { roomID: string }) {
  const {
    active: copiedActive,
    setActive: setCopiedActive,
    setInActive: setCopiedInActive,
  } = useToggle(false);

  const handleCopyLink = async (text = '') => {
    const success = await copyToClipboard(text);

    if (success) {
      setCopiedActive();
      setTimeout(() => {
        setCopiedInActive();
      }, 2000);
    } else {
      alert('Fail to copy link');
    }
  };

  return (
    <div className="flex flex-col gap-4 rounded-lg px-4 py-5 ring-1 ring-zinc-700 md:p-6">
      <div>
        <h2 className="font-medium">Share this room</h2>
        <p className="mt-0.5 text-sm text-zinc-400">
          Invite others to join by sending this link
        </p>
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <input
            className="w-full rounded-md bg-zinc-950 px-4 py-2.5 text-sm text-zinc-200 outline-none ring-1 ring-zinc-700 focus-visible:ring-1 focus-visible:ring-zinc-400"
            type="text"
            readOnly
            defaultValue={`${APP_ORIGIN}/room/${roomID}`}
          />
        </div>
        <div>
          <Button
            className="flex min-w-0 items-center gap-1.5 rounded-md bg-zinc-800 px-4 py-2 text-sm hover:bg-zinc-700 active:bg-zinc-600"
            onClick={() => handleCopyLink(`${APP_ORIGIN}/room/${roomID}`)}
          >
            <span>
              {copiedActive ? (
                <CheckIcon className="h-5 w-5" />
              ) : (
                <CopyOutlineIcon className="h-5 w-5" />
              )}
            </span>
            <span className="hidden md:inline">
              {copiedActive ? 'Copied!' : 'Copy link'}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}
