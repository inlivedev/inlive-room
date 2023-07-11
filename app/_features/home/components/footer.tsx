export default function HomeFooter() {
  return (
    <footer className="mx-auto w-full max-w-xl px-4 py-6 lg:max-w-5xl lg:py-8">
      <p className="text-center text-xs text-neutral-400 lg:text-left">
        inLive Room uses inLive Hub API. Learn more about{' '}
        <a
          href="https://inlive.app/realtime-interactive/"
          className="underline underline-offset-4 hover:no-underline"
        >
          inLive Hub
        </a>
        .
      </p>
      <hr className="my-5 border-t border-neutral-700" />
      <p className="text-center text-xs text-neutral-400">
        &copy; {new Date().getFullYear()} inLive. All rights reserved
      </p>
    </footer>
  );
}
