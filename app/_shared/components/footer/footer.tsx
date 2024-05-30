export default function Footer() {
  return (
    <footer className="flex flex-col gap-5 py-5 md:py-10">
      <hr className="border-t border-zinc-700" />
      <div className="inline-flex flex-col gap-2 text-xs text-zinc-400 sm:flex-row sm:justify-center">
        <span>
          <span>&copy; {new Date().getFullYear()}&nbsp;</span>
          <span>inLive</span>
        </span>
        <span className="hidden sm:inline">•</span>
        <div className="flex flex-row flex-wrap gap-2">
          <a
            href="https://inlive.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline-offset-4 hover:underline"
          >
            About inLive
          </a>
          <span className="hidden sm:inline">•</span>
          <a
            href="https://github.com/inlivedev/inlive-room/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline-offset-4 hover:underline"
          >
            Star us on GitHub
          </a>
          <span className="hidden sm:inline">•</span>
          <a
            href="https://www.linkedin.com/company/inliveapp/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline-offset-4 hover:underline"
          >
            Follow us on LinkedIn
          </a>
          <span className="hidden sm:inline">•</span>
          <a
            href="https://x.com/inLiveApp/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline-offset-4 hover:underline"
          >
            Follow us on X
          </a>
        </div>
      </div>
    </footer>
  );
}
