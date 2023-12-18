import Link from 'next/link';
import Header from '@/_shared/components/header/header';
import Footer from '@/_shared/components/footer/footer';

type HTTPErrorProps = {
  code: number;
  title: string;
  description: string;
};

export default function HTTPError({
  code,
  title,
  description,
}: HTTPErrorProps) {
  return (
    <div className="min-viewport-height bg-neutral-900 text-neutral-200">
      <div className="min-viewport-height mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-4">
        <Header logoText="inLive Room" logoHref="/" />
        <main className="mx-auto flex flex-1 flex-col justify-center">
          <div className="flex items-center gap-5">
            <div>
              <b className="block text-2xl">{code}</b>
            </div>
            <div>
              <b className="block text-base font-medium">{title}</b>
              <p className="mt-0.5 block text-sm text-neutral-400">
                {description}
              </p>
            </div>
          </div>
          <div className="mt-12 text-center">
            <Link
              href="/"
              className="flex justify-center rounded-md bg-neutral-900 px-12 py-2 text-sm font-medium text-neutral-200  outline-none ring-1 ring-neutral-700 hover:bg-neutral-800/60"
            >
              Back to front page
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
