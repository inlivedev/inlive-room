import { copyToClipboard } from '@/_shared/utils/copy-to-clipboard';
import { Button } from '@nextui-org/react';

export default function LobbyInvite({
  pageId,
  origin,
}: {
  pageId: string;
  origin: string;
}) {
  const handleCopyLink = async (text = '') => {
    const success = await copyToClipboard(text);
    if (success) {
      alert('Link has been successfully copied!');
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
            className="w-full rounded-md bg-zinc-800 px-4 py-2.5 text-sm text-zinc-200 outline-none ring-1 ring-zinc-700 focus-visible:ring-1 focus-visible:ring-zinc-400"
            type="text"
            readOnly
            value={`${origin}/room/${pageId}`}
          />
        </div>
        <div>
          <Button
            className="rounded-md bg-zinc-800 px-4 py-2 text-sm hover:bg-zinc-700 active:bg-zinc-600"
            onClick={() => handleCopyLink(`${origin}/room/${pageId}`)}
          >
            Copy Link
          </Button>
        </div>
      </div>
    </div>
  );
}
