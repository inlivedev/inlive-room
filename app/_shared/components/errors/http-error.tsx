'use client';

import Link from 'next/link';
import Header from '@/_shared/components/header/header';
import Footer from '@/_shared/components/footer/footer';

type HTTPErrorProps = {
  code?: number;
  title: string;
  description: string;
};

export default function HTTPError({
  code,
  title,
  description,
}: HTTPErrorProps) {
  const openSignInModal = () => {
    document.dispatchEvent(new CustomEvent('open:sign-in-modal'));
  };

  return (
    <div className="bg-neutral-900 text-neutral-200">
      <div className="min-viewport-height mx-auto flex h-full w-full max-w-7xl flex-1 flex-col gap-10 px-4">
        <Header logoText="inLive Room" logoHref="/" />
        <main className="mx-auto flex max-w-md flex-1 flex-col justify-center">
          <div className="flex items-center gap-5">
            {code === 404 && (
              <div>
                <b className="block text-2xl">{code}</b>
              </div>
            )}
            <div>
              <b className="block text-base font-medium">{title}</b>
              <p className="mt-0.5 block text-sm text-neutral-400">
                {description}
              </p>
            </div>
          </div>
          {code === 404 ? (
            <div className="mt-12 text-center">
              <Link
                href="/"
                className="flex w-full justify-center rounded-md bg-neutral-900 px-12 py-2 text-sm font-medium text-neutral-200  outline-none ring-1 ring-neutral-700 hover:bg-neutral-800/60"
              >
                Go to front page
              </Link>
            </div>
          ) : code === 401 ? (
            <div className="mt-12 text-center">
              <button
                className="flex w-full justify-center rounded-md bg-neutral-900 px-12 py-2 text-sm font-medium text-neutral-200  outline-none ring-1 ring-neutral-700 hover:bg-neutral-800/60"
                onClick={openSignInModal}
              >
                Sign in to your account
              </button>
            </div>
          ) : null}
        </main>
        <Footer />
      </div>
    </div>
  );
}
