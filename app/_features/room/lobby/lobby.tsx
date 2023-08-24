import Link from 'next/link';
import Header from '@/_shared/components/header/header';
import Footer from '@/_shared/components/footer/footer';

type LobbyProps = {
  setOpenConference(): void;
};

export default function Lobby({ setOpenConference }: LobbyProps) {
  const handleClick = () => {
    setOpenConference();
  };

  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-10 px-4">
        <Header />
        <main className="flex flex-1 flex-col justify-center">
          <div className="flex w-full max-w-xl flex-col">
            <div>
              <h2 className="text-xs font-medium uppercase tracking-tight text-neutral-400">
                Room ID
              </h2>
              <b className="block text-3xl font-bold">wpdxrig0O</b>
            </div>
            <div className="mt-10">
              <h3 className="font-medium">Ready to enter the room?</h3>
              <p className="mt-1 text-neutral-400">
                Anyone with the link or room ID can enter this room. Make sure
                your device camera and microphone are working properly.
              </p>
            </div>
            <div className="mt-10 flex flex-col gap-6 rounded-lg px-4 py-5 ring-1 ring-neutral-700 lg:p-6">
              <div>
                <h2 className="text-base font-semibold">Share this room</h2>
                <p className="text-sm text-neutral-400">
                  Invite others to join by sending this link
                </p>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <input
                    className="w-full rounded-md bg-neutral-900 px-4 py-2 text-sm text-neutral-200 outline-none ring-1 ring-neutral-700  focus-visible:ring-1 focus-visible:ring-neutral-200"
                    type="text"
                    readOnly
                    value="https://room.inlive.app/room/wpdxrig0O"
                  />
                </div>
                <div>
                  <button className="rounded-md bg-neutral-800 px-4 py-2 text-sm font-medium hover:bg-neutral-800/60">
                    Copy Link
                  </button>
                </div>
              </div>
            </div>
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
                  onClick={handleClick}
                >
                  Enter room
                </button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
