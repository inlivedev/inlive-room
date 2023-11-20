export default function Footer() {
  return (
    <footer className="flex flex-col gap-5 py-6 lg:py-8">
      <LearnMore />
      <hr className="border-t border-zinc-700" />
      <Copyright />
    </footer>
  );
}

function LearnMore() {
  return (
    <p className="text-center text-xs text-zinc-400">
      This is a project that demonstrates the capabilities of{' '}
      <a
        href="https://inlive.app/docs/getting-started/using-hub-api/"
        target="_blank"
        className="underline underline-offset-4 hover:no-underline"
      >
        inLive Hub API
      </a>
      .
    </p>
  );
}

function Copyright() {
  return (
    <p className="text-center text-xs text-zinc-400">
      &copy; {new Date().getFullYear()}{' '}
      <a href="https://inlive.app" target="_blank">
        inLive
      </a>{' '}
      &nbsp;—&nbsp; The source code is available on{' '}
      <a
        href="https://github.com/inlivedev/inlive-room/"
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-4 hover:no-underline"
      >
        GitHub
      </a>
    </p>
  );
}
