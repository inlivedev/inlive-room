import { copyToClipboard } from '@/_shared/utils/copy-to-clipboard';

export default function LobbyInvite({
  roomId,
  origin,
}: {
  roomId: string;
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
    <div className="mt-10 flex flex-col gap-6 rounded-lg px-4 py-5 ring-1 ring-neutral-700 lg:p-6">
      <div>
        <h2 className="font-medium">Share this room</h2>
        <p className="mt-0.5 text-sm text-neutral-400">
          Invite others to join by sending this link
        </p>
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <input
            className="w-full rounded-md bg-neutral-900 px-4 py-2 text-sm text-neutral-200 outline-none ring-1 ring-neutral-700  focus-visible:ring-1 focus-visible:ring-neutral-200"
            type="text"
            readOnly
            value={`${origin}/room/${roomId}`}
          />
        </div>
        <div>
          <button
            className="rounded-md bg-neutral-800 px-4 py-2 text-sm font-medium hover:bg-neutral-800/60"
            onClick={() => handleCopyLink(`${origin}/room/${roomId}`)}
          >
            Copy Link
          </button>
        </div>
      </div>
    </div>
  );
}
