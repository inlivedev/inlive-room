import Link from 'next/link';

export default function LobbyCTA({
  openConferenceRoom,
}: {
  openConferenceRoom(): void;
}) {
  return (
    <div className="mt-10 flex flex-row flex-wrap justify-center gap-x-8 gap-y-6">
      <div className="flex-1">
        <Link
          href="/"
          className="flex w-full min-w-[240px] justify-center rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-neutral-200  outline-none ring-1 ring-neutral-700 hover:bg-neutral-800/60"
        >
          Back to front page
        </Link>
      </div>
      <div className="flex-1">
        <button
          className="flex w-full min-w-[240px] justify-center rounded-md bg-red-700 px-4 py-2 text-sm font-medium hover:bg-red-700/90"
          onClick={openConferenceRoom}
        >
          Enter this room
        </button>
      </div>
    </div>
  );
}
