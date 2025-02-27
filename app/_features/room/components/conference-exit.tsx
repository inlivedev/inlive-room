import { Button, Link } from "@heroui/react";
import Header from '@/_shared/components/header/header';

export default function ConferenceExit() {
  return (
    <div className="min-viewport-height mx-auto flex h-full w-full max-w-7xl flex-col px-4">
      <Header logoText="inLive Room" logoHref="/" />
      <main className="flex-1 pt-8 text-center">
        <h2 className="text-3xl font-medium md:text-4xl">You left the Room</h2>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 md:flex-row">
          <div className="md:order-2">
            <Button
              className="h-9 w-52 rounded-md bg-red-700 px-3 py-2 text-sm font-medium text-zinc-200 antialiased hover:bg-red-600 active:bg-red-500 md:w-auto"
              onClick={() => window.location.reload()}
            >
              Rejoin to Room
            </Button>
          </div>
          <div>
            <Link
              href="/"
              className="block h-9 w-52 rounded-md bg-zinc-800 px-3 py-2 text-sm font-medium antialiased  hover:bg-zinc-700 active:bg-zinc-600 md:w-auto"
            >
              Back to Homepage
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
