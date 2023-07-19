export default function Footer() {
  return (
    <footer className="mx-auto flex w-full max-w-xl flex-col gap-5 px-4 py-6 lg:max-w-5xl lg:py-8">
      <LearnMore />
      <hr className="border-t border-neutral-700" />
      <Copyright />
    </footer>
  );
}

function LearnMore() {
  return (
    <p className="text-center text-xs text-neutral-400 lg:text-left">
      inLive Room uses inLive Hub API. Learn more about{' '}
      <a
        href="https://inlive.app/realtime-interactive/"
        target="_blank"
        className="underline underline-offset-4 hover:no-underline"
      >
        inLive Hub
      </a>
      .
    </p>
  );
}

function Copyright() {
  return (
    <p className="text-center text-xs text-neutral-400">
      &copy; {new Date().getFullYear()} inLive. All rights reserved
    </p>
  );
}
